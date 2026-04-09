import httpx
from pydantic import BaseModel
from app.config import settings


class SpringClientError(Exception):
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail
        super().__init__(f"Spring Boot {status_code}: {detail}")


class AnatomyPartResponse(BaseModel):
    canonical_id: str
    display_name: str
    system: str
    region: str
    overview: str | None = None
    status: str


class DiseaseResponse(BaseModel):
    canonical_id: str
    name: str
    etymology: list[dict[str, str]] = []
    commonness: str
    category: str | None = None


class SourceDocumentRequest(BaseModel):
    url: str
    title: str
    source_type: str
    trust_score: float
    jurisdiction: str | None = None
    raw_text: str


class EvidenceChunkRequest(BaseModel):
    source_document_id: str
    chunk_text: str
    section_title: str | None = None
    chunk_index: int
    embedding: list[float]


class CandidateClaimRequest(BaseModel):
    subject_canonical_id: str
    relation_type: str
    object_canonical_id: str
    claim_text: str
    confidence: float
    supporting_chunk_ids: list[str]


_client: httpx.AsyncClient | None = None


def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(
            base_url=settings.spring_base_url,
            timeout=30.0,
        )
    return _client


async def _handle_response(response: httpx.Response) -> dict:
    if response.status_code == 404:
        raise SpringClientError(404, response.text)
    response.raise_for_status()
    return response.json()


async def get_anatomy_part(canonical_id: str) -> AnatomyPartResponse:
    client = _get_client()
    resp = await client.get(f"/api/anatomy/parts/{canonical_id}")
    data = await _handle_response(resp)
    return AnatomyPartResponse(
        canonical_id=data["canonicalId"],
        display_name=data["displayName"],
        system=data["system"],
        region=data["region"],
        overview=data.get("overview"),
        status=data["status"],
    )


async def get_diseases_for_part(canonical_id: str) -> list[DiseaseResponse]:
    client = _get_client()
    resp = await client.get(f"/api/anatomy/parts/{canonical_id}/diseases")
    data = await _handle_response(resp)
    return [
        DiseaseResponse(
            canonical_id=d["canonicalId"],
            name=d["name"],
            etymology=d.get("etymology", []),
            commonness=d["commonness"],
            category=d.get("category"),
        )
        for d in data
    ]


async def register_source_document(request: SourceDocumentRequest) -> dict:
    client = _get_client()
    resp = await client.post("/api/admin/sources", json=request.model_dump())
    return await _handle_response(resp)


async def store_evidence_chunks(chunks: list[EvidenceChunkRequest]) -> dict:
    client = _get_client()
    resp = await client.post(
        "/api/admin/evidence/chunks",
        json=[c.model_dump() for c in chunks],
    )
    return await _handle_response(resp)


async def submit_candidate_claims(claims: list[CandidateClaimRequest]) -> dict:
    client = _get_client()
    resp = await client.post(
        "/api/admin/evidence/claims",
        json=[c.model_dump() for c in claims],
    )
    return await _handle_response(resp)
