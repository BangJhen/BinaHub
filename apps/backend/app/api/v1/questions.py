"""
BinaHub Backend - /api/v1/generate-questions route.
Generates 3 personalised daily reflection questions for a worker via BinaBot.
"""

from __future__ import annotations
from fastapi import APIRouter, Depends

from app.dependencies import verify_secret
from app.models.schemas import QuestionRequest
from app.services.llm.service import generate_questions

router = APIRouter()


@router.post("/generate-questions")
async def generate_daily_questions(
    request: QuestionRequest,
    _:       None = Depends(verify_secret),
):
    """
    Generate 3 personalised reflection questions for a worker.
    Used by BinaBot to start the daily check-in conversation.
    """
    try:
        questions = await generate_questions(request.worker_context)
        return {"status": "ok", "questions": questions}
    except Exception as e:
        print(f"[ERROR] Question generation failed: {e}")
        # Graceful fallback so BinaBot can always start a conversation
        return {
            "status": "ok",
            "questions": [
                "Gimana kabarmu setelah bekerja hari ini?",
                "Apa hal yang paling berkesan hari ini?",
                "Ada yang ingin kamu ceritakan lebih lanjut?",
            ],
        }
