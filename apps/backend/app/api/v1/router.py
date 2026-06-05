"""
BinaHub Backend - v1 API aggregator.
All /api/v1/* routes are registered here and included in the main app.
"""

from __future__ import annotations
from fastapi import APIRouter

from app.api.v1 import analyze, questions, chat

router = APIRouter(prefix="/api/v1")

router.include_router(analyze.router,   tags=["Analysis"])
router.include_router(questions.router, tags=["Questions"])
router.include_router(chat.router,      tags=["Chat"])
