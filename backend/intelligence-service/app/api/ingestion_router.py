from fastapi import APIRouter
from pydantic import BaseModel

from app.services.ingestion.nice_service import scrape_nice
from app.services.ingestion.medlineplus_service import ingest_medlineplus

router = APIRouter(prefix="/intelligence/ingestion", tags=["ingestion"])


class IngestionRequest(BaseModel):
    topic: str


@router.post("/nice")
async def ingest_nice(request: IngestionRequest):
    return await scrape_nice(request.topic)


@router.post("/medlineplus")
async def ingest_medlineplus_route(request: IngestionRequest):
    return await ingest_medlineplus(request.topic)
