"""
BinaHub Backend - Shared FastAPI dependencies.
"""

from __future__ import annotations
from typing import Optional
from fastapi import Header, HTTPException

from app.config import settings


def verify_secret(x_ai_secret: Optional[str] = Header(None)) -> None:
    """
    Verify the x-ai-secret header in production.
    No-op in development to avoid friction during local testing.
    """
    if settings.is_production and x_ai_secret != settings.AI_SERVICE_SECRET:
        raise HTTPException(status_code=401, detail="Invalid AI service secret")
