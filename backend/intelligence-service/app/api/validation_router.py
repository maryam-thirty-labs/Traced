from fastapi import APIRouter
from pydantic import BaseModel

from app.services.extraction.conflict_detector import check_conflicts, ConflictResult

router = APIRouter(prefix="/intelligence/validation", tags=["validation"])


class ConflictCheckRequest(BaseModel):
    new_claim: dict
    existing_claims: list[dict]


@router.post("/check-conflicts")
async def check_conflicts_route(request: ConflictCheckRequest) -> ConflictResult:
    return check_conflicts(
        new_claim=request.new_claim,
        existing_claims=request.existing_claims,
    )
