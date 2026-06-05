"""
BinaHub Backend - Embedding service.
Generates 384-dim text embeddings (all-MiniLM-L6-v2) and syncs results
to Supabase (journal_embeddings + checkins tables).
"""

from __future__ import annotations
import os
import numpy as np
from sentence_transformers import SentenceTransformer
from supabase import create_client, Client

from app.config import settings


# ── Singleton model (loaded once at startup) ──────────────────────────────────
_model: SentenceTransformer | None = None


def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        print("[START] Loading embedding model (all-MiniLM-L6-v2)...")
        _model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        print("[OK] Embedding model loaded.")
    return _model


def get_supabase() -> Client:
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)


# ── Core functions ────────────────────────────────────────────────────────────

def embed(text: str) -> list[float]:
    """Generate a 384-dim normalised embedding vector. ~50 ms per call."""
    vector = get_model().encode(text, normalize_embeddings=True)
    return vector.tolist()


async def store_embedding(checkin_id: str, worker_id: str, text: str) -> bool:
    """Generate and persist an embedding to the journal_embeddings table."""
    try:
        vector   = embed(text)
        supabase = get_supabase()
        result   = supabase.table("journal_embeddings").insert({
            "journal_id":       checkin_id,
            "worker_id":        worker_id,
            "embedding":        vector,
            "embedding_model":  "all-MiniLM-L6-v2",
        }).execute()
        if result.data:
            print(f"[OK] Embedding stored for checkin {checkin_id}")
            return True
        return False
    except Exception as e:
        print(f"[ERROR] Failed to store embedding: {e}")
        return False


async def update_checkin_with_ai_result(
    checkin_id:      str,
    ai_result:       dict,
    trend_direction: str | None = None,
) -> bool:
    """Write AI analysis fields back to the checkins table."""
    try:
        supabase    = get_supabase()
        update_data = {
            "ai_score":          ai_result.get("score"),
            "ai_label":          ai_result.get("label"),
            "ai_reasoning":      ai_result.get("reasoning"),
            "ai_flags":          ai_result.get("flags", {}),
            "dominant_emotions": ai_result.get("dominant_emotions", []),
            "intervention_note": ai_result.get("intervention_note"),
        }
        if trend_direction:
            update_data["trend_direction"] = trend_direction

        result = supabase.table("checkins").update(update_data).eq("id", checkin_id).execute()
        if result.data:
            print(f"[OK] Checkin {checkin_id} updated (score: {ai_result.get('score')}, label: {ai_result.get('label')})")
            return True
        return False
    except Exception as e:
        print(f"[ERROR] Failed to update checkin with AI result: {e}")
        return False
