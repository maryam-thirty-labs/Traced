"""Cache wrapper for AdaptiveExplainer results.

Keys are namespaced under `adapted:` because core-service shares the same
Redis instance and uses `exp:cache:` for its own explanation cache.
"""
import json
import logging

from app.clients.redis_client import get_redis_client

from .adaptive_explainer import (
    AdaptiveExplanationResult,
    adapt_explanation,
)

logger = logging.getLogger(__name__)

CACHE_TTL_SECONDS = 7 * 24 * 60 * 60  # 7 days
CACHE_KEY_PREFIX = "adapted:"


def _cache_key(structure_id: str, user_background: str) -> str:
    return f"{CACHE_KEY_PREFIX}{structure_id}:{user_background}"


async def get_or_adapt(
    structure_id: str,
    structure_name: str,
    clinical_text: str,
    source_citations: list,
    user_background: str,
    etymology_root,
    anthropic_client=None,
    redis_client=None,
) -> AdaptiveExplanationResult:
    """Return cached or freshly adapted explanation.

    Never raises. Cache errors are logged and the uncached LLM path runs.
    Fallback responses are NOT cached (the user should see a real adapted
    response on retry once the underlying failure clears).
    """

    if redis_client is None:
        redis_client = get_redis_client()

    key = _cache_key(structure_id, user_background)

    try:
        cached = await redis_client.get(key)
        if cached:
            data = json.loads(cached)
            return AdaptiveExplanationResult(
                adapted_text=data["adapted_text"],
                aha_fact=data.get("aha_fact"),
                # Always serve fresh citations in case the underlying source
                # set has changed since the LLM response was cached.
                citations=source_citations,
                user_background_applied=data["user_background_applied"],
            )
    except Exception as e:  # noqa: BLE001
        logger.warning("Cache read error for key %s: %s", key, e)

    result = await adapt_explanation(
        structure_name=structure_name,
        clinical_text=clinical_text,
        source_citations=source_citations,
        user_background=user_background,
        etymology_root=etymology_root,
        anthropic_client=anthropic_client,
    )

    if result.user_background_applied != "fallback":
        try:
            await redis_client.setex(
                key,
                CACHE_TTL_SECONDS,
                json.dumps({
                    "adapted_text": result.adapted_text,
                    "aha_fact": result.aha_fact,
                    "user_background_applied": result.user_background_applied,
                }),
            )
        except Exception as e:  # noqa: BLE001
            logger.warning("Cache write error for key %s: %s", key, e)

    return result
