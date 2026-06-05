"""
BinaHub Backend - LLM analysis & generation functions.
Orchestrates calls to the LLM client using prompts from prompts.py.
"""

from __future__ import annotations
import json

from app.services.llm.client import get_llm_client, get_model_name
from app.services.llm.prompts import (
    ANALYSIS_SYSTEM_PROMPT,
    QUESTION_SYSTEM_PROMPT,
    REPLY_SYSTEM_PROMPT,
    build_quick_prompt,
    build_rag_prompt,
    build_question_prompt,
    build_reply_prompt,
)


# ── Safety post-processing ────────────────────────────────────────────────────

def apply_safety_override(result: dict) -> dict:
    """
    Post-processing after LLM response:
    - Validates required fields; returns Kuning fallback if missing.
    - Clamps score to 1-10.
    - Forces label=Merah + score≥8 if any safety flag is active.
    """
    required = ["score", "label", "reasoning", "flags", "dominant_emotions", "intervention_note"]
    if not all(f in result for f in required):
        return {
            "score": 5,
            "label": "Kuning",
            "reasoning": "Sistem tidak dapat menganalisis teks dengan baik. Mohon tinjau manual.",
            "flags": {
                "self_harm_risk": False,
                "relapse_risk": False,
                "violence_risk": False,
                "crisis_immediate": False,
            },
            "dominant_emotions": ["tidak terdeteksi"],
            "intervention_note": "Manual review diperlukan karena sistem gagal memproses.",
            "trend_analysis": None,
            "is_fallback": True,
        }

    result["score"] = max(1, min(10, int(result.get("score", 5))))

    flags = result.get("flags", {})
    any_flag = any([
        flags.get("self_harm_risk", False),
        flags.get("relapse_risk", False),
        flags.get("violence_risk", False),
        flags.get("crisis_immediate", False),
    ])

    if any_flag:
        result["label"] = "Merah"
        result["score"] = max(8, result["score"])
        result["_safety_override"] = True

    # Normalize label by score (then re-apply flag override)
    if result["score"] <= 4:
        result["label"] = "Hijau"
    elif result["score"] <= 7:
        result["label"] = "Kuning"
    else:
        result["label"] = "Merah"

    if any_flag:
        result["label"] = "Merah"

    return result


# ── Analysis ──────────────────────────────────────────────────────────────────

async def analyze_quick(journal_text: str, worker_context: dict | None = None) -> dict:
    """
    Fast-path LLM call (no RAG context).
    Target: < 2 seconds.
    """
    client = get_llm_client()
    response = await client.chat.completions.create(
        model=get_model_name(),
        temperature=0.2,
        max_tokens=500,
        top_p=0.9,
        messages=[
            {"role": "system", "content": ANALYSIS_SYSTEM_PROMPT},
            {"role": "user",   "content": build_quick_prompt(journal_text, worker_context)},
        ],
        response_format={"type": "json_object"},
    )
    result = json.loads(response.choices[0].message.content)
    return apply_safety_override(result)


async def analyze_with_rag(
    journal_text: str,
    context: dict,
    worker_context: dict | None = None,
) -> dict:
    """
    Full RAG-enhanced LLM call with 7-day historical context.
    Target: 3-5 seconds (runs in background, non-blocking).
    """
    client = get_llm_client()
    response = await client.chat.completions.create(
        model=get_model_name(),
        temperature=0.2,
        max_tokens=700,
        top_p=0.9,
        messages=[
            {"role": "system", "content": ANALYSIS_SYSTEM_PROMPT},
            {"role": "user",   "content": build_rag_prompt(journal_text, context, worker_context)},
        ],
        response_format={"type": "json_object"},
    )
    result = json.loads(response.choices[0].message.content)
    return apply_safety_override(result)


# ── Question generation ───────────────────────────────────────────────────────

async def generate_questions(worker_context: dict | None = None) -> list[str]:
    """Generate 3 personalised reflection questions for a worker."""
    client = get_llm_client()
    response = await client.chat.completions.create(
        model=get_model_name(),
        temperature=0.8,
        max_tokens=300,
        top_p=0.95,
        messages=[
            {"role": "system", "content": QUESTION_SYSTEM_PROMPT},
            {"role": "user",   "content": build_question_prompt(worker_context)},
        ],
        response_format={"type": "json_object"},
    )
    result    = json.loads(response.choices[0].message.content)
    questions = result.get("questions", [])
    while len(questions) < 3:
        questions.append("Apa yang paling kamu rasakan hari ini?")
    return questions[:3]


# ── BinaBot reply ─────────────────────────────────────────────────────────────

async def generate_bina_reply(user_answer: str, question: str, next_question: str) -> str:
    """Generate a contextual BinaBot reply that leads naturally into the next question."""
    client = get_llm_client()
    response = await client.chat.completions.create(
        model=get_model_name(),
        temperature=0.7,
        max_tokens=200,
        top_p=0.95,
        messages=[
            {"role": "system", "content": REPLY_SYSTEM_PROMPT},
            {"role": "user",   "content": build_reply_prompt(user_answer, question, next_question)},
        ],
        response_format={"type": "json_object"},
    )
    result = json.loads(response.choices[0].message.content)
    return result.get("reply", next_question)
