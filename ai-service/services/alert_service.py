from __future__ import annotations
"""
BinaHub AI Service - Alert Service
Handles inserting alerts to Supabase and routing based on risk level.
"""

import os
from datetime import datetime
from services.embedding_service import get_supabase


async def send_alert_if_needed(
    worker_id: str,
    umkm_id: str | None,
    placement_id: str | None,
    checkin_id: str,
    ai_result: dict
) -> bool:
    """
    Insert alert to Supabase alerts table based on AI analysis result.
    
    Routing logic:
    - Merah + crisis_immediate = true → CRITICAL (title includes [KRITIS])
    - Merah + crisis_immediate = false → HIGH
    - Kuning → MEDIUM (only insert if pattern deteriorating, not every kuning)
    - Hijau → no alert
    
    Returns True if alert was inserted.
    """
    label = ai_result.get("label", "Hijau")
    flags = ai_result.get("flags", {})
    score = ai_result.get("score", 1)
    reasoning = ai_result.get("reasoning", "")
    intervention = ai_result.get("intervention_note", "")
    
    # Only alert for Merah
    if label != "Merah":
        return False
    
    if not umkm_id:
        print(f"[WARNING] No UMKM ID for worker {worker_id}, alert not sent to UMKM")
    
    is_crisis = flags.get("crisis_immediate", False)
    is_self_harm = flags.get("self_harm_risk", False)
    is_relapse = flags.get("relapse_risk", False)
    is_violence = flags.get("violence_risk", False)
    
    # Build title
    flag_parts = []
    if is_crisis:
        flag_parts.append("KRISIS SEGERA")
    if is_self_harm:
        flag_parts.append("Risiko Self-Harm")
    if is_relapse:
        flag_parts.append("Risiko Relapse")
    if is_violence:
        flag_parts.append("Risiko Kekerasan")
    
    title_prefix = "[KRITIS] " if is_crisis else "[WASPADA] "
    flag_label = " · ".join(flag_parts) if flag_parts else "Risiko Tinggi"
    title = f"{title_prefix}Pekerja terdeteksi {flag_label} (Skor: {score}/10)"
    
    message = f"{reasoning}\n\nSaran Tindakan: {intervention}"
    
    try:
        supabase = get_supabase()
        
        alert_data = {
            "worker_id": worker_id,
            "title": title,
            "message": message,
            "status": "unread"
        }
        
        if umkm_id:
            alert_data["umkm_id"] = umkm_id
        if placement_id:
            alert_data["placement_id"] = placement_id
        
        result = supabase.table("alerts").insert(alert_data).execute()
        
        if result.data:
            level_text = "[CRITICAL]" if is_crisis else "[WARNING]"
            print(f"{level_text} Alert inserted for worker {worker_id[:8]}...")
            return True
        return False
        
    except Exception as e:
        print(f"[ERROR] Failed to insert alert: {e}")
        return False


async def save_rag_analysis(
    worker_id: str,
    checkin_id: str,
    rag_result: dict,
    context: dict,
    timing: dict
) -> bool:
    """
    Save full RAG analysis to rag_analyses table for audit trail.
    """
    try:
        supabase = get_supabase()
        
        similarity_scores = [
            j.get("similarity", 1.0)
            for j in context.get("last_7_days", [])
        ]
        
        result = supabase.table("rag_analyses").insert({
            "worker_id": worker_id,
            "journal_id": checkin_id,
            "retrieved_journals_count": context.get("retrieved_count", 0),
            "similarity_scores": similarity_scores,
            "rag_score": rag_result.get("score"),
            "rag_label": rag_result.get("label"),
            "rag_reasoning": rag_result.get("reasoning"),
            "trend_analysis": rag_result.get("trend_analysis"),
            "retrieval_time_ms": timing.get("retrieval_ms"),
            "llm_inference_time_ms": timing.get("llm_ms"),
            "total_latency_ms": timing.get("total_ms"),
            "model_version": os.getenv("AI_MODEL", "gpt-4o-mini")
        }).execute()
        
        return bool(result.data)
    except Exception as e:
        print(f"[WARNING] Failed to save RAG analysis audit: {e}")
        return False
