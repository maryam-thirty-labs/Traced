from fastapi import APIRouter
from pydantic import BaseModel

from app.services.grounding.grounding_service import generate_explanation

router = APIRouter(prefix="/intelligence/grounding", tags=["grounding"])


class GroundingRequest(BaseModel):
    entity_id: str
    approved_claims: list[dict]
    chunks: list[dict]


@router.post("/explain")
async def explain(request: GroundingRequest):
    result = await generate_explanation(
        entity_id=request.entity_id,
        approved_claims=request.approved_claims,
        chunks=request.chunks,
    )
    return result.model_dump()
