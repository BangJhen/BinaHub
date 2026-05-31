"""
BinaHub AI Service - RAG Retriever
Retrieves 7-day historical journal context using pgvector similarity search.
Includes Redis caching with 1-hour TTL.
"""

import json
import os
import numpy as np
from datetime import datetime
from typing import Optional

from supabase import create_client
from services.embedding_service import embed, get_supabase

# ─── Redis Setup (optional) ───────────────────────────────────────────────────
try:
    import redis as redis_lib
    _redis_client = redis_lib.from_url(
        os.getenv("REDIS_URL", "redis://localhost:6379"),
        decode_responses=True
    )
    _redis_client.ping()
    REDIS_AVAILABLE = True
    print("[OK] Redis connected")
except Exception:
    _redis_client = None
    REDIS_AVAILABLE = False
    print("[WARNING] Redis unavailable - caching disabled")

CACHE_TTL = 3600  # 1 jam


# ─── Trend Analysis ───────────────────────────────────────────────────────────
def analyze_trend(scores: list[int]) -> str:
    """
    Detect trend from historical scores.
    Returns: 'stable' | 'improving' | 'deteriorating' | 'insufficient_data'
    """
    if len(scores) < 2:
        return "insufficient_data"
    
    mid = len(scores) // 2
    first_half = np.mean(scores[:mid])
    second_half = np.mean(scores[mid:])
    diff = second_half - first_half
    
    if abs(diff) < 1.0:
        return "stable"
    elif diff < 0:
        return "improving"   # score turun = kondisi membaik
    else:
        return "deteriorating"  # score naik = kondisi memburuk


# ─── Cache Helpers ────────────────────────────────────────────────────────────
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


def _set_cache(worker_id: str, context: dict):
    if not REDIS_AVAILABLE:
        return
    try:
        _redis_client.setex(
            f"worker_context:{worker_id}",
            CACHE_TTL,
            json.dumps(context, default=str)
        )
    except Exception as e:
        print(f"[WARNING] Cache write failed: {e}")


def invalidate_cache(worker_id: str):
    """Call this when a new journal is added for a worker."""
    if not REDIS_AVAILABLE:
        return
    try:
        _redis_client.delete(f"worker_context:{worker_id}")
    except Exception:
        pass


# ─── Core Retrieval ───────────────────────────────────────────────────────────
async def retrieve_context(worker_id: str, current_journal: str) -> dict:
    """
    Retrieve 7-day journal context for a worker.
    Uses Redis cache first (L1), then pgvector similarity search (L2).
    
    Returns:
        {
            "worker_id": str,
            "retrieved_count": int,
            "last_7_days": [...],
            "avg_score": float,
            "trend": str,
            "retrieved_at": str
        }
    """
    # L1: Check Redis cache
    cached = _get_cache(worker_id)
    if cached:
        print(f"[OK] Cache HIT for worker {worker_id[:8]}...")
        return cached
    
    print(f"[INFO] Cache MISS for worker {worker_id[:8]}..., retrieving from DB")
    
    try:
        supabase = get_supabase()
        
        # Embed current journal for similarity search
        current_embedding = embed(current_journal)
        
        # pgvector similarity search: top-5 similar journals from last 7 days
        # Using Supabase RPC (stored procedure) for vector search
        result = supabase.rpc("match_journals_7d", {
            "query_embedding": current_embedding,
            "worker_id_param": worker_id,
            "match_count": 7
        }).execute()
        
        journals = result.data or []
        
    except Exception as e:
        print(f"[WARNING] Vector search failed ({e}), falling back to chronological fetch")
        
        # Fallback: Get last 7 checkins chronologically (no similarity)
        try:
            supabase = get_supabase()
            result = supabase.table("checkins") \
                .select("id, content, ai_score, ai_label, submitted_at") \
                .eq("worker_id", worker_id) \
                .not_.is_("ai_score", "null") \
                .order("submitted_at", desc=True) \
                .limit(7) \
                .execute()
            
            journals = [
                {
                    "date": j["submitted_at"][:10],
                    "text": j["content"],
                    "score": j["ai_score"] or 5,
                    "label": j["ai_label"] or "Kuning",
                    "similarity": 1.0
                }
                for j in (result.data or [])
            ]
        except Exception as e2:
            print(f"[ERROR] Fallback also failed: {e2}")
            journals = []
    
    # Build context object
    scores = [j.get("score", 5) for j in journals if j.get("score")]
    avg_score = float(np.mean(scores)) if scores else None
    trend = analyze_trend(scores)
    
    context = {
        "worker_id": worker_id,
        "retrieved_count": len(journals),
        "last_7_days": [
            {
                "date": j.get("date", ""),
                "text": j.get("text", j.get("content", ""))[:200],
                "score": j.get("score", j.get("ai_score", 5)),
                "label": j.get("label", j.get("ai_label", "Kuning")),
                "similarity": j.get("similarity", 1.0)
            }
            for j in journals
        ],
        "avg_score": avg_score,
        "trend": trend,
        "retrieved_at": datetime.now().isoformat()
    }
    
    # Cache for 1 hour
    _set_cache(worker_id, context)
    
    return context
