"""
BinaHub Backend - RAG retriever.
Retrieves 7-day historical journal context using pgvector similarity search
with optional Redis caching (L1 cache, 1-hour TTL).
"""

from __future__ import annotations
import json
import numpy as np
from datetime import datetime
from typing import Optional

from app.config import settings
from app.services.embedding import embed, get_supabase


# ── Redis setup (optional) ────────────────────────────────────────────────────
try:
    import redis as redis_lib
    _redis_client = redis_lib.from_url(settings.REDIS_URL, decode_responses=True)
    _redis_client.ping()
    REDIS_AVAILABLE = True
    print("[OK] Redis connected")
except Exception:
    _redis_client   = None
    REDIS_AVAILABLE = False
    print("[WARNING] Redis unavailable - caching disabled")

CACHE_TTL = 3600  # 1 hour


# ── Trend analysis ────────────────────────────────────────────────────────────

def analyze_trend(scores: list[int]) -> str:
    """
    Detect trend from a list of historical scores.
    Returns: 'stable' | 'improving' | 'deteriorating' | 'insufficient_data'
    """
    if len(scores) < 2:
        return "insufficient_data"

    mid         = len(scores) // 2
    first_half  = np.mean(scores[:mid])
    second_half = np.mean(scores[mid:])
    diff        = second_half - first_half

    if abs(diff) < 1.0:
        return "stable"
    elif diff < 0:
        return "improving"       # lower score = better condition
    else:
        return "deteriorating"   # higher score = worse condition


# ── Cache helpers ─────────────────────────────────────────────────────────────

def _get_cache(worker_id: str) -> Optional[dict]:
    if not REDIS_AVAILABLE:
        return None
    try:
        cached = _redis_client.get(f"worker_context:{worker_id}")
        if cached:
            return json.loads(cached)
    except Exception:
        pass
    return None


def _set_cache(worker_id: str, context: dict) -> None:
    if not REDIS_AVAILABLE:
        return
    try:
        _redis_client.setex(
            f"worker_context:{worker_id}",
            CACHE_TTL,
            json.dumps(context, default=str),
        )
    except Exception as e:
        print(f"[WARNING] Cache write failed: {e}")


def invalidate_cache(worker_id: str) -> None:
    """Call after a new journal is stored so the next request gets fresh data."""
    if not REDIS_AVAILABLE:
        return
    try:
        _redis_client.delete(f"worker_context:{worker_id}")
    except Exception:
        pass


# ── Core retrieval ────────────────────────────────────────────────────────────

async def retrieve_context(worker_id: str, current_journal: str) -> dict:
    """
    Retrieve 7-day journal context for a worker.

    Strategy:
      L1 — Redis cache (fast, ~1 ms)
      L2 — pgvector similarity search via Supabase RPC (exact, ~200 ms)
      L3 — Chronological fallback if pgvector fails

    Returns a context dict:
      {
          "worker_id": str,
          "retrieved_count": int,
          "last_7_days": [{"date", "text", "score", "label", "similarity"}, ...],
          "avg_score": float | None,
          "trend": str,
          "retrieved_at": str,
      }
    """
    # L1: Redis cache
    cached = _get_cache(worker_id)
    if cached:
        print(f"[OK] Cache HIT for worker {worker_id[:8]}...")
        return cached

    print(f"[INFO] Cache MISS for worker {worker_id[:8]}..., retrieving from DB")

    try:
        supabase          = get_supabase()
        current_embedding = embed(current_journal)
        result = supabase.rpc("match_journals_7d", {
            "query_embedding":  current_embedding,
            "worker_id_param":  worker_id,
            "match_count":      7,
        }).execute()
        journals = result.data or []

    except Exception as e:
        print(f"[WARNING] Vector search failed ({e}), falling back to chronological fetch")
        try:
            supabase = get_supabase()
            result   = (
                supabase.table("checkins")
                .select("id, content, ai_score, ai_label, submitted_at")
                .eq("worker_id", worker_id)
                .not_.is_("ai_score", "null")
                .order("submitted_at", desc=True)
                .limit(7)
                .execute()
            )
            journals = [
                {
                    "date":       j["submitted_at"][:10],
                    "text":       j["content"],
                    "score":      j["ai_score"] or 5,
                    "label":      j["ai_label"] or "Kuning",
                    "similarity": 1.0,
                }
                for j in (result.data or [])
            ]
        except Exception as e2:
            print(f"[ERROR] Fallback also failed: {e2}")
            journals = []

    scores    = [j.get("score", 5) for j in journals if j.get("score")]
    avg_score = float(np.mean(scores)) if scores else None
    trend     = analyze_trend(scores)

    context = {
        "worker_id":       worker_id,
        "retrieved_count": len(journals),
        "last_7_days": [
            {
                "date":       j.get("date", ""),
                "text":       j.get("text", j.get("content", ""))[:200],
                "score":      j.get("score", j.get("ai_score", 5)),
                "label":      j.get("label", j.get("ai_label", "Kuning")),
                "similarity": j.get("similarity", 1.0),
            }
            for j in journals
        ],
        "avg_score":    avg_score,
        "trend":        trend,
        "retrieved_at": datetime.now().isoformat(),
    }

    _set_cache(worker_id, context)
    return context
