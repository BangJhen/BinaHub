"""
BinaHub AI Service - Embedding Service
Generates and stores 384-dim text embeddings using all-MiniLM-L6-v2
"""

import os
import numpy as np
from sentence_transformers import SentenceTransformer
from supabase import create_client, Client

# ─── Singleton Model (loaded once at startup) ────────────────────────────────
_model: SentenceTransformer | None = None


def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        print("[START] Loading embedding model (all-MiniLM-L6-v2)...")
        _model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        print("[OK] Embedding model loaded.")
    return _model


def get_supabase() -> Client:
    return create_client(
        os.getenv("SUPABASE_URL"),
        os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    )


# ─── Core Functions ───────────────────────────────────────────────────────────
def embed(text: str) -> list[float]:
    """
    Generate 384-dim embedding vector for a given text.
    ~50ms per call.
    """
    model = get_model()
    vector = model.encode(text, normalize_embeddings=True)
    return vector.tolist()


async def store_embedding(checkin_id: str, worker_id: str, text: str) -> bool:
    """
    Generate embedding and store to journal_embeddings table.
    Returns True if successful.
    """
    try:
        vector = embed(text)
        
        supabase = get_supabase()
        result = supabase.table("journal_embeddings").insert({
            "journal_id": checkin_id,
            "worker_id": worker_id,
            "embedding": vector,
            "embedding_model": "all-MiniLM-L6-v2"
        }).execute()
        
        if result.data:
            print(f"[OK] Embedding stored for checkin {checkin_id}")
            return True
        return False
    except Exception as e:
        print(f"[ERROR] Failed to store embedding: {e}")
        return False


async def update_checkin_with_ai_result(
    checkin_id: str,
    ai_result: dict,
    trend_direction: str = None
) -> bool:
    """
    Update the checkins table with AI analysis results.
    """
    try:
        supabase = get_supabase()
        
        update_data = {
            "ai_score": ai_result.get("score"),
            "ai_label": ai_result.get("label"),
            "ai_reasoning": ai_result.get("reasoning"),
            "ai_flags": ai_result.get("flags", {}),
            "dominant_emotions": ai_result.get("dominant_emotions", []),
            "intervention_note": ai_result.get("intervention_note"),
        }
        
        if trend_direction:
            update_data["trend_direction"] = trend_direction
        
        result = supabase.table("checkins").update(update_data).eq("id", checkin_id).execute()
        
        if result.data:
            print(f"[OK] Checkin {checkin_id} updated with AI result (score: {ai_result.get('score')}, label: {ai_result.get('label')})")
            return True
        return False
    except Exception as e:
        print(f"[ERROR] Failed to update checkin with AI result: {e}")
        return False
