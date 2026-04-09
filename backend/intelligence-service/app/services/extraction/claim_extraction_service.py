import json
from pydantic import BaseModel
from openai import AsyncOpenAI

from app.config import settings
from app.services.retrieval.retrieval_service import RetrievedChunk

VALID_RELATION_TYPES = [
    "INVOLVED_IN",
    "CAUSED_BY",
    "PRESENTS_WITH",
    "TREATED_BY",
    "TARGETS",
]

EXTRACTION_PROMPT = """You are a medical knowledge extraction system. Given the following text chunks from medical sources, extract structured claims as JSON.

Each claim must have:
- subject_canonical_id: the canonical ID of the subject entity (e.g. ANAT_*, DIS_*, MECH_*, TRT_*)
- relation_type: one of INVOLVED_IN, CAUSED_BY, PRESENTS_WITH, TREATED_BY, TARGETS
- object_canonical_id: the canonical ID of the object entity
- claim_text: a concise natural language statement of the claim
- supporting_chunk_ids: list of chunk_ids that support this claim

Return a JSON array of claims. Only use the relation types listed above. Do not fabricate claims — only extract what is directly supported by the text.

Context entity: {entity_id}

Chunks:
{chunks_text}

Return ONLY valid JSON array. No markdown, no explanation."""


class ExtractedClaim(BaseModel):
    subject_canonical_id: str
    relation_type: str
    object_canonical_id: str
    claim_text: str
    confidence: float
    supporting_chunk_ids: list[str]


_client: AsyncOpenAI | None = None


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=settings.openai_api_key)
    return _client


def _compute_confidence(claim_data: dict, chunk_count: int) -> float:
    """
    Confidence scoring: penalise single-chunk support.
    base × coverage_factor
    """
    supporting = len(claim_data.get("supporting_chunk_ids", []))
    base = 0.7
    if supporting >= 3:
        coverage_factor = 1.0
    elif supporting == 2:
        coverage_factor = 0.8
    else:
        # Single-chunk: always < 0.5
        coverage_factor = 0.5

    confidence = base * coverage_factor
    return round(min(confidence, 1.0), 3)


async def extract_claims(
    entity_id: str,
    chunks: list[RetrievedChunk],
    max_retries: int = 2,
) -> list[ExtractedClaim]:
    """
    Extract structured claims from retrieved chunks using LLM.
    Controlled relationType vocabulary enforced.
    Single-chunk support reduces confidence (scoring policy, not hard block).
    """
    if not chunks:
        return []

    client = _get_client()

    chunks_text = "\n\n".join(
        f"[chunk_id: {c.chunk_id}]\n{c.chunk_text}"
        for c in chunks
    )

    prompt = EXTRACTION_PROMPT.format(
        entity_id=entity_id,
        chunks_text=chunks_text,
    )

    for attempt in range(max_retries + 1):
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            response_format={"type": "json_object"},
        )

        raw = response.choices[0].message.content or ""

        try:
            parsed = json.loads(raw)
            # Handle both {"claims": [...]} and [...]
            if isinstance(parsed, dict):
                claims_data = parsed.get("claims", [])
            elif isinstance(parsed, list):
                claims_data = parsed
            else:
                if attempt < max_retries:
                    continue
                return []
            break
        except json.JSONDecodeError:
            if attempt < max_retries:
                continue
            return []

    results: list[ExtractedClaim] = []
    for claim_data in claims_data:
        relation_type = claim_data.get("relation_type", "")
        if relation_type not in VALID_RELATION_TYPES:
            continue

        confidence = _compute_confidence(claim_data, len(chunks))

        results.append(ExtractedClaim(
            subject_canonical_id=claim_data.get("subject_canonical_id", entity_id),
            relation_type=relation_type,
            object_canonical_id=claim_data.get("object_canonical_id", ""),
            claim_text=claim_data.get("claim_text", ""),
            confidence=confidence,
            supporting_chunk_ids=claim_data.get("supporting_chunk_ids", []),
        ))

    return results
