"""
BinaHub Backend - LLM client factory.
Returns the correct AsyncOpenAI client based on provider config.
"""

from __future__ import annotations
from openai import AsyncOpenAI

from app.config import settings


def get_llm_client() -> AsyncOpenAI:
    """
    Menggunakan standard AsyncOpenAI client karena endpoint Azure yang digunakan
    sudah dalam format OpenAI-compatible (.../openai/v1).
    """
    if settings.AI_PROVIDER == "azure":
        return AsyncOpenAI(
            base_url=settings.AZURE_OPENAI_ENDPOINT,
            api_key=settings.AZURE_OPENAI_API_KEY,
        )
    return AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


def get_model_name() -> str:
    if settings.AI_PROVIDER == "azure":
        return settings.AZURE_OPENAI_DEPLOYMENT
    return settings.AI_MODEL
