"""
BinaHub Backend - /api/v1/bina-reply route.
BinaBot conversational reply generation.
"""

from __future__ import annotations
from fastapi import APIRouter, Depends

from app.dependencies import verify_secret
from app.models.schemas import BinaReplyRequest
from app.services.llm.service import generate_bina_reply

router = APIRouter()


@router.post("/bina-reply")
async def bina_reply(
    request: BinaReplyRequest,
    _:       None = Depends(verify_secret),
):
    """
    Generate a contextual BinaBot reply to the user's answer.
    Returns a natural response referencing what the user said
    and leads into the next question.
    """
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
