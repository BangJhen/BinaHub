"""
BinaHub Backend - FastAPI application factory.

Architecture:
  POST /api/v1/analyze           → Fast path (< 2s): Quick LLM, background RAG
  POST /api/v1/analyze/quick-only → Fast path only (no RAG)
  POST /api/v1/generate-questions → BinaBot daily questions
  POST /api/v1/bina-reply        → BinaBot conversational reply
  GET  /health                   → Health check
"""

from __future__ import annotations
from contextlib import asynccontextmanager

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.services.embedding import get_model
from app.api.v1.router import router as v1_router


# ── Startup / shutdown ────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Pre-load the embedding model at startup so the first request is fast."""
    print("[START] BinaHub Backend starting...")
    get_model()  # loads all-MiniLM-L6-v2 into memory
    print("[OK] Backend ready!")
    yield
    print("[STOP] Backend shutting down...")


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="BinaHub Backend",
    description="Psychological risk assessment & worker monitoring API for BinaHub",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://*.vercel.app",
        settings.FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────────────────────────

app.include_router(v1_router)


@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status":   "ok",
        "service":  "BinaHub Backend",
        "version":  "1.0.0",
        "model":    settings.AI_MODEL,
        "provider": settings.AI_PROVIDER,
    }
