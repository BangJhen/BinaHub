"""
BinaHub Backend - Configuration
Centralises all environment variable access in one place.
"""

from __future__ import annotations
import os


class Settings:
    # ── OpenAI / Azure ────────────────────────────────────────────────────────
    AI_PROVIDER: str        = os.getenv("AI_PROVIDER", "openai")
    AI_MODEL: str           = os.getenv("AI_MODEL", "gpt-4o-mini")
    OPENAI_API_KEY: str     = os.getenv("OPENAI_API_KEY", "")

    AZURE_OPENAI_API_KEY: str    = os.getenv("AZURE_OPENAI_API_KEY", "")
    AZURE_OPENAI_ENDPOINT: str   = os.getenv("AZURE_OPENAI_ENDPOINT", "")
    AZURE_OPENAI_DEPLOYMENT: str = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4o-mini")

    # ── Supabase ──────────────────────────────────────────────────────────────
    SUPABASE_URL: str              = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

    # ── Redis ─────────────────────────────────────────────────────────────────
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")

    # ── Security ──────────────────────────────────────────────────────────────
    AI_SERVICE_SECRET: str = os.getenv("AI_SERVICE_SECRET", "binahub-ai-secret-key")
    ENVIRONMENT: str       = os.getenv("ENVIRONMENT", "development")

    # ── Server ────────────────────────────────────────────────────────────────
    HOST: str          = os.getenv("HOST", "0.0.0.0")
    PORT: int          = int(os.getenv("PORT", "8001"))
    FRONTEND_URL: str  = os.getenv("FRONTEND_URL", "http://localhost:3000")

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"


settings = Settings()
