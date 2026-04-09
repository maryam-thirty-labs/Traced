from fastapi import FastAPI

from app.api.ingestion_router import router as ingestion_router
from app.api.grounding_router import router as grounding_router

app = FastAPI(title="Traced Intelligence Service", version="0.1.0")

app.include_router(ingestion_router)
app.include_router(grounding_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
