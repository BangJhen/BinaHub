from __future__ import annotations
"""
BinaHub AI Service - FastAPI Main Entry Point
Psychological risk assessment for ex-prisoner rehabilitation workers.

Architecture:
  POST /api/v1/analyze      → Fast path (< 2s): Quick LLM, no RAG
  POST /api/v1/analyze/full → Full RAG (3-5s): Background enrichment
  GET  /health              → Health check
"""

import os
import time
import asyncio
from contextlib import asynccontextmanager
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException, BackgroundTasks, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional

load_dotenv()

# ─── Import Services ──────────────────────────────────────────────────────────
from services.llm_service import analyze_quick, analyze_with_rag, generate_questions, generate_bina_reply
from services.embedding_service import (
    get_model,
    store_embedding,
    update_checkin_with_ai_result,
    get_supabase
)
from services.rag_retriever import retrieve_context, invalidate_cache
from services.alert_service import send_alert_if_needed, save_rag_analysis


# ─── App Startup ──────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Pre-load embedding model at startup so first request is fast."""
    print("[START] BinaHub AI Service starting...")
    get_model()  # Load all-MiniLM-L6-v2 into memory
    print("[OK] AI Service ready!")
    yield
    print("[STOP] AI Service shutting down...")


app = FastAPI(
    title="BinaHub AI Service",
    description="Psychological risk assessment API for BinaHub worker monitoring",
    version="1.0.0",
    lifespan=lifespan
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://*.vercel.app",
        os.getenv("FRONTEND_URL", "http://localhost:3000")
    ],
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


# ─── Request/Response Models ──────────────────────────────────────────────────
class AnalyzeRequest(BaseModel):
    worker_id: str = Field(..., description="UUID of the worker")
    checkin_id: str = Field(..., description="UUID of the checkin record")
    journal_text: str = Field(..., min_length=10, description="Journal text from worker")
    umkm_id: Optional[str] = Field(None, description="UUID of the UMKM employer")
    placement_id: Optional[str] = Field(None, description="UUID of active placement")
    worker_context: Optional[dict] = Field(None, description="Worker metadata (age, job_type, etc)")


class QuickResult(BaseModel):
    score: int
    label: str
    reasoning: str
    flags: dict
    dominant_emotions: list
    intervention_note: str
    is_preliminary: bool = True


class QuestionRequest(BaseModel):
    worker_id: Optional[str] = Field(None, description="UUID of the worker")
    worker_context: Optional[dict] = Field(None, description="Worker metadata for personalization")


class BinaReplyRequest(BaseModel):
    user_answer: str = Field(..., min_length=1, description="User's answer to the previous question")
    question: str = Field(..., description="The question that was asked")
    next_question: str = Field(..., description="The next question to ask")


# ─── Auth Helper ─────────────────────────────────────────────────────────────
def verify_secret(x_ai_secret: Optional[str] = None):
    expected = os.getenv("AI_SERVICE_SECRET", "binahub-ai-secret-key")
    if os.getenv("ENVIRONMENT") == "production" and x_ai_secret != expected:
        raise HTTPException(status_code=401, detail="Invalid AI service secret")


# ─── Background Enrichment Task ───────────────────────────────────────────────
async def run_rag_enrichment(
    worker_id: str,
    checkin_id: str,
    journal_text: str,
    quick_result: dict,
    umkm_id: str | None,
    placement_id: str | None,
    worker_context: dict | None
):
    """
    Background task: RAG enrichment after fast-path response.
    1. Retrieve 7-day context
    2. Re-analyze with full context
    3. Update checkins table
    4. Store embedding
    5. Invalidate cache
    6. Send alert if Merah
    7. Save audit trail
    """
    t_start = time.time()

    try:
        print(f"[SYNC] RAG enrichment started for checkin {checkin_id[:8]}...")

        # 1. Retrieve context (with cache)
        t_retrieval = time.time()
        context = await retrieve_context(worker_id, journal_text)
        retrieval_ms = int((time.time() - t_retrieval) * 1000)

        # 2. Full LLM analysis with RAG context
        t_llm = time.time()
        rag_result = await analyze_with_rag(journal_text, context, worker_context)
        llm_ms = int((time.time() - t_llm) * 1000)

        total_ms = int((time.time() - t_start) * 1000)

        # 3. Update checkins table with enriched result
        trend_dir = context.get("trend")
        await update_checkin_with_ai_result(checkin_id, rag_result, trend_dir)

        # 4. Store embedding
        await store_embedding(checkin_id, worker_id, journal_text)

        # 5. Invalidate worker cache (new data available)
        invalidate_cache(worker_id)

        # 6. Send alert if needed
        await send_alert_if_needed(
            worker_id=worker_id,
            umkm_id=umkm_id,
            placement_id=placement_id,
            checkin_id=checkin_id,
            ai_result=rag_result
        )

        # 7. Save RAG audit trail
        timing = {"retrieval_ms": retrieval_ms, "llm_ms": llm_ms, "total_ms": total_ms}
        await save_rag_analysis(worker_id, checkin_id, rag_result, context, timing)

        print(f"[OK] RAG enrichment done for {checkin_id[:8]}... | Total: {total_ms}ms | Score: {rag_result.get('score')} {rag_result.get('label')}")

    except Exception as e:
        print(f"[ERROR] RAG enrichment failed for {checkin_id[:8]}...: {e}")

        # Fallback: at least update with quick_result if RAG fails
        try:
            await update_checkin_with_ai_result(checkin_id, quick_result)
        except Exception:
            pass


# ─── Routes ───────────────────────────────────────────────────────────────────
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "BinaHub AI Service",
        "version": "1.0.0",
        "model": os.getenv("AI_MODEL", "gpt-4o-mini"),
        "provider": os.getenv("AI_PROVIDER", "openai")
    }


@app.post("/api/v1/analyze")
async def analyze_journal(
    request: AnalyzeRequest,
    background_tasks: BackgroundTasks,
    x_ai_secret: Optional[str] = Header(None)
):
    """
    Main analysis endpoint.

    Flow:
    1. Quick LLM call (< 2s) → return immediately
    2. RAG enrichment runs in background (3-5s) → updates DB

    Frontend should:
    - Show quick_result immediately
    - Subscribe to Supabase Realtime for the updated score
    """
    verify_secret(x_ai_secret)

    if not request.journal_text.strip():
        raise HTTPException(status_code=400, detail="Journal text cannot be empty")

    t_start = time.time()

    # ── Fast Path (blocking) ──────────────────────────────────────────────────
    try:
        quick_result = await analyze_quick(
            request.journal_text,
            request.worker_context
        )
    except Exception as e:
        print(f"[ERROR] Quick LLM failed: {e}")
        # Fallback result
        quick_result = {
            "score": 5,
            "label": "Kuning",
            "reasoning": "Sistem sementara tidak dapat menganalisis. Tim akan meninjau secara manual.",
            "flags": {"self_harm_risk": False, "relapse_risk": False, "violence_risk": False, "crisis_immediate": False},
            "dominant_emotions": [],
            "intervention_note": "Manual review required",
            "is_fallback": True
        }

    fast_ms = int((time.time() - t_start) * 1000)
    print(f"[FAST] Quick analysis done in {fast_ms}ms | Score: {quick_result.get('score')} {quick_result.get('label')}")

    # ── Background Enrichment (non-blocking) ──────────────────────────────────
    background_tasks.add_task(
        run_rag_enrichment,
        worker_id=request.worker_id,
        checkin_id=request.checkin_id,
        journal_text=request.journal_text,
        quick_result=quick_result,
        umkm_id=request.umkm_id,
        placement_id=request.placement_id,
        worker_context=request.worker_context
    )

    return {
        "status": "analyzing",
        "checkin_id": request.checkin_id,
        "quick_result": {
            **quick_result,
            "is_preliminary": True
        },
        "message": "Analisis awal selesai. Analisis mendalam sedang berjalan di latar belakang.",
        "fast_path_ms": fast_ms
    }


@app.post("/api/v1/analyze/quick-only")
async def analyze_quick_only(
    request: AnalyzeRequest,
    x_ai_secret: Optional[str] = Header(None)
):
    """
    Quick analysis only, no background RAG.
    Used for testing or when RAG is not needed.
    """
    verify_secret(x_ai_secret)

    result = await analyze_quick(request.journal_text, request.worker_context)
    return {"status": "completed", "result": result}


@app.post("/api/v1/generate-questions")
async def generate_daily_questions(
    request: QuestionRequest,
    x_ai_secret: Optional[str] = Header(None)
):
    """
    Generate 3 personalized reflection questions for a worker.
    Used by BinaBot to start daily conversation.
    """
    verify_secret(x_ai_secret)

    try:
        questions = await generate_questions(request.worker_context)
        return {"status": "ok", "questions": questions}
    except Exception as e:
        print(f"[ERROR] Question generation failed: {e}")
        # Fallback questions
        return {
            "status": "ok",
            "questions": [
                "Gimana kabarmu setelah bekerja hari ini?",
                "Apa hal yang paling berkesan hari ini?",
                "Ada yang ingin kamu ceritakan lebih lanjut?"
            ]
        }


@app.post("/api/v1/bina-reply")
async def bina_reply(
    request: BinaReplyRequest,
    x_ai_secret: Optional[str] = Header(None)
):
    """
    Generate a contextual BinaBot reply to the user's answer.
    Returns a natural response that references what the user said
    and leads into the next question.
    """
    verify_secret(x_ai_secret)

    try:
        reply = await generate_bina_reply(
            user_answer=request.user_answer,
            question=request.question,
            next_question=request.next_question,
        )
        return {"status": "ok", "reply": reply}
    except Exception as e:
        print(f"[ERROR] Bina reply generation failed: {e}")
        # Graceful fallback: just ask the next question directly
        return {"status": "ok", "reply": request.next_question}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
