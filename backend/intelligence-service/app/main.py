from fastapi import FastAPI

from app.api.ingestion_router import router as ingestion_router
from app.api.grounding_router import router as grounding_router
from app.api.validation_router import router as validation_router
from app.api.explanations_router import router as explanations_router

app = FastAPI(title="Traced Intelligence Service", version="0.1.0")

app.include_router(ingestion_router)
app.include_router(grounding_router)
app.include_router(validation_router)
app.include_router(explanations_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
