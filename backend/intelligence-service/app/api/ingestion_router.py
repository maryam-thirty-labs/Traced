from fastapi import APIRouter
from pydantic import BaseModel

from app.services.ingestion.nice_service import scrape_nice
from app.services.ingestion.medlineplus_service import ingest_medlineplus
from app.services.ingestion.pubmed_service import fetch_pubmed_abstracts

router = APIRouter(prefix="/intelligence/ingestion", tags=["ingestion"])


class IngestionRequest(BaseModel):
    topic: str


@router.post("/nice")
async def ingest_nice(request: IngestionRequest):
    return await scrape_nice(request.topic)


@router.post("/medlineplus")
async def ingest_medlineplus_route(request: IngestionRequest):
    return await ingest_medlineplus(request.topic)


@router.post("/pubmed")
async def ingest_pubmed(request: IngestionRequest):
    return await fetch_pubmed_abstracts(request.topic)
