"""
BinaHub Backend - Pydantic request/response schemas.
All API models live here so routes stay thin.
"""

from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, Field


# ── Requests ──────────────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    worker_id:      str            = Field(..., description="UUID of the worker")
    checkin_id:     str            = Field(..., description="UUID of the checkin record")
    journal_text:   str            = Field(..., min_length=10, description="Journal text from worker")
    umkm_id:        Optional[str]  = Field(None, description="UUID of the UMKM employer")
    placement_id:   Optional[str]  = Field(None, description="UUID of active placement")
    worker_context: Optional[dict] = Field(None, description="Worker metadata (age, job_type, etc)")


class QuestionRequest(BaseModel):
    worker_id:      Optional[str]  = Field(None, description="UUID of the worker")
    worker_context: Optional[dict] = Field(None, description="Worker metadata for personalization")


class BinaReplyRequest(BaseModel):
    user_answer:   str = Field(..., min_length=1, description="User's answer to the previous question")
    question:      str = Field(..., description="The question that was asked")
    next_question: str = Field(..., description="The next question to ask")


# ── Responses ─────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status:   str
    service:  str
    version:  str
    model:    str
    provider: str
