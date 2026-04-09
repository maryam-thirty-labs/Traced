from fastapi import APIRouter
from pydantic import BaseModel

from app.services.ingestion.nice_service import scrape_nice

router = APIRouter(prefix="/intelligence/ingestion", tags=["ingestion"])


class IngestionRequest(BaseModel):
    topic: str


@router.post("/nice")
async def ingest_nice(request: IngestionRequest):
    return await scrape_nice(request.topic)
