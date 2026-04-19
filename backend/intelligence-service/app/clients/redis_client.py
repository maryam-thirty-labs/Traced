"""Lazy async Redis singleton.

Same lazy-module pattern as embedding_service._get_client(). The same Redis
instance is shared with core-service (Spring), so every key this service
writes MUST use the `adapted:` prefix to isolate from core-service's
`exp:cache:` prefix — see adaptive_cache.py.
"""
from redis.asyncio import Redis, from_url

from app.config import settings


_client: Redis | None = None


def get_redis_client() -> Redis:
    global _client
    if _client is None:
        _client = from_url(settings.redis_url, decode_responses=True)
    return _client
