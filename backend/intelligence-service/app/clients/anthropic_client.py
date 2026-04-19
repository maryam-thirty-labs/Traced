"""Lazy AsyncAnthropic singleton.

Mirrors the lazy-module pattern used by embedding_service._get_client() so
we never instantiate a new client per request and we share a single
connection pool across the app.
"""
from anthropic import AsyncAnthropic

from app.config import settings


_client: AsyncAnthropic | None = None


def get_anthropic_client() -> AsyncAnthropic:
    global _client
    if _client is None:
        _client = AsyncAnthropic(api_key=settings.anthropic_api_key)
    return _client
