"""Adaptive explanation endpoint.

Receives pre-fetched clinical text + metadata from core-service, rewrites it
for the user's background, returns adapted output.

Intel-service stays stateless here — no direct DB reads — because anatomy
data is owned by core-service. The core-service proxy at
POST /api/intelligence/explanations/adaptive handles data assembly
(see `Sprint 37 Step 5`).
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.explanation.adaptive_cache import get_or_adapt

router = APIRouter(prefix="/explanations", tags=["explanations"])


class AdaptiveExplanationRequest(BaseModel):
    structure_id: str = Field(..., description="Canonical ID used for cache partitioning")
    structure_name: str
    clinical_text: str
    citations: list = Field(default_factory=list)
    etymology_root: str | None = None
    user_background: str = Field(
        ...,
        description="curious_adult | med_student | fitness | health_scare",
    )


class AdaptiveExplanationResponse(BaseModel):
    adapted_text: str
    aha_fact: str | None
    citations: list
    user_background_applied: str


@router.post("/adaptive", response_model=AdaptiveExplanationResponse)
async def adaptive_explanation(
    request: AdaptiveExplanationRequest,
) -> AdaptiveExplanationResponse:
    """Primary Story Mode endpoint.

    Never raises on LLM errors — falls back to raw clinical_text. Only fails
    with 4xx on obviously bad requests (empty clinical_text).
    """
    if not request.clinical_text or not request.clinical_text.strip():
        raise HTTPException(status_code=400, detail="clinical_text is required")

    result = await get_or_adapt(
        structure_id=request.structure_id,
        structure_name=request.structure_name,
        clinical_text=request.clinical_text,
        source_citations=request.citations,
        user_background=request.user_background,
        etymology_root=request.etymology_root,
    )

    return AdaptiveExplanationResponse(
        adapted_text=result.adapted_text,
        aha_fact=result.aha_fact,
        citations=result.citations,
        user_background_applied=result.user_background_applied,
    )
