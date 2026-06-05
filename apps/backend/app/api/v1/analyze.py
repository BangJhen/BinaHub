"""
BinaHub Backend - /api/v1/analyze routes.

POST /api/v1/analyze           → Fast path (< 2s) + background RAG enrichment
POST /api/v1/analyze/quick-only → Fast path only (testing / no RAG)
"""

from __future__ import annotations
import time

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException

from app.dependencies import verify_secret
from app.models.schemas import AnalyzeRequest
from app.services.llm.service import analyze_quick, analyze_with_rag
from app.services.embedding import store_embedding, update_checkin_with_ai_result
from app.services.rag import retrieve_context, invalidate_cache
from app.services.alert import send_alert_if_needed, save_rag_analysis

router = APIRouter()


# ── Background enrichment ─────────────────────────────────────────────────────

async def _run_rag_enrichment(
    worker_id:      str,
    checkin_id:     str,
    journal_text:   str,
    quick_result:   dict,
    umkm_id:        str | None,
    placement_id:   str | None,
    worker_context: dict | None,
) -> None:
    """
    Background task: RAG enrichment after the fast-path response has been sent.

    Steps:
      1. Retrieve 7-day context (with Redis cache)
      2. Re-analyse with full RAG context
      3. Update checkins table
      4. Store embedding
      5. Invalidate worker cache
      6. Send alert if Merah
      7. Save RAG audit trail
    """
    t_start = time.time()
    try:
        print(f"[SYNC] RAG enrichment started for checkin {checkin_id[:8]}...")

        t_retrieval = time.time()
        context     = await retrieve_context(worker_id, journal_text)
        retrieval_ms = int((time.time() - t_retrieval) * 1000)

        t_llm       = time.time()
        rag_result  = await analyze_with_rag(journal_text, context, worker_context)
        llm_ms      = int((time.time() - t_llm) * 1000)

        total_ms    = int((time.time() - t_start) * 1000)

        trend_dir   = context.get("trend")
        await update_checkin_with_ai_result(checkin_id, rag_result, trend_dir)
        await store_embedding(checkin_id, worker_id, journal_text)
        invalidate_cache(worker_id)

        await send_alert_if_needed(
            worker_id=worker_id,
            umkm_id=umkm_id,
            placement_id=placement_id,
            checkin_id=checkin_id,
            ai_result=rag_result,
        )

        timing = {"retrieval_ms": retrieval_ms, "llm_ms": llm_ms, "total_ms": total_ms}
        await save_rag_analysis(worker_id, checkin_id, rag_result, context, timing)

        print(
            f"[OK] RAG enrichment done for {checkin_id[:8]}... | "
            f"Total: {total_ms}ms | Score: {rag_result.get('score')} {rag_result.get('label')}"
        )

    except Exception as e:
        print(f"[ERROR] RAG enrichment failed for {checkin_id[:8]}...: {e}")
        # Fallback: at least persist the quick result so the DB isn't blank
        try:
            await update_checkin_with_ai_result(checkin_id, quick_result)
        except Exception:
            pass


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/analyze")
async def analyze_journal(
    request:          AnalyzeRequest,
    background_tasks: BackgroundTasks,
    _:                None = Depends(verify_secret),
):
    """
    Main analysis endpoint.

    Flow:
      1. Quick LLM call (< 2 s) → return immediately
      2. RAG enrichment in background (3-5 s) → updates DB via Supabase Realtime

    Frontend should:
      - Display quick_result immediately
      - Subscribe to Supabase Realtime for the enriched score update
    """
    if not request.journal_text.strip():
        raise HTTPException(status_code=400, detail="Journal text cannot be empty")

    t_start = time.time()

    # Fast path
    try:
        quick_result = await analyze_quick(request.journal_text, request.worker_context)
    except Exception as e:
        print(f"[ERROR] Quick LLM failed: {e}")
        quick_result = {
            "score": 5,
            "label": "Kuning",
            "reasoning": "Sistem sementara tidak dapat menganalisis. Tim akan meninjau secara manual.",
            "flags": {"self_harm_risk": False, "relapse_risk": False, "violence_risk": False, "crisis_immediate": False},
            "dominant_emotions": [],
            "intervention_note": "Manual review required",
            "is_fallback": True,
        }

    fast_ms = int((time.time() - t_start) * 1000)
    print(f"[FAST] Quick analysis done in {fast_ms}ms | Score: {quick_result.get('score')} {quick_result.get('label')}")

    # Kick off background enrichment
    background_tasks.add_task(
        _run_rag_enrichment,
        worker_id=request.worker_id,
        checkin_id=request.checkin_id,
        journal_text=request.journal_text,
        quick_result=quick_result,
        umkm_id=request.umkm_id,
        placement_id=request.placement_id,
        worker_context=request.worker_context,
    )

    return {
        "status":       "analyzing",
        "checkin_id":   request.checkin_id,
        "quick_result": {**quick_result, "is_preliminary": True},
        "message":      "Analisis awal selesai. Analisis mendalam sedang berjalan di latar belakang.",
        "fast_path_ms": fast_ms,
    }


@router.post("/analyze/quick-only")
async def analyze_quick_only(
    request: AnalyzeRequest,
    _:       None = Depends(verify_secret),
):
    """Quick analysis only — no background RAG. Useful for testing."""
    result = await analyze_quick(request.journal_text, request.worker_context)
    return {"status": "completed", "result": result}
