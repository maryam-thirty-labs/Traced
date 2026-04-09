import json
from pydantic import BaseModel
from openai import AsyncOpenAI

from app.config import settings

UNCERTAIN_TEXT = (
    "There is currently insufficient approved evidence to provide a grounded explanation "
    "for this structure. As more sources are reviewed and claims are approved, this "
    "explanation will be updated. Please consult a qualified medical professional for "
    "clinical guidance."
)

GROUNDING_PROMPT = """You are a medical explanation writer for a learning platform. Generate a clear, educational explanation grounded ONLY in the provided approved claims and source chunks.

Rules:
- Only state facts supported by the provided claims
- Cite claim IDs in brackets, e.g. [claim-1]
- Do not fabricate medical assertions
- Use clear, accessible language suitable for medical students
- If evidence is limited, acknowledge uncertainty

Entity: {entity_id}

Approved Claims:
{claims_text}

Supporting Chunks:
{chunks_text}

Write a concise, grounded explanation (2-4 paragraphs)."""


class GroundedExplanation(BaseModel):
    explanation_text: str
    cited_claim_ids: list[str]
    cited_chunk_ids: list[str]
    confidence_label: str  # HIGH, MEDIUM, LOW, UNCERTAIN


_client: AsyncOpenAI | None = None


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=settings.openai_api_key)
    return _client


def _determine_confidence_label(
    claim_count: int,
    source_count: int,
) -> str:
    """
    HIGH: ≥3 claims from ≥2 sources
    MEDIUM: ≥2 claims
    LOW: 1 claim
    UNCERTAIN: 0 claims
    """
    if claim_count == 0:
        return "UNCERTAIN"
    if claim_count >= 3 and source_count >= 2:
        return "HIGH"
    if claim_count >= 2:
        return "MEDIUM"
    return "LOW"


async def generate_explanation(
    entity_id: str,
    approved_claims: list[dict],
    chunks: list[dict],
) -> GroundedExplanation:
    """
    Generate a grounded explanation from approved claims and supporting chunks.
    0 approved claims → UNCERTAIN label with safe uncertainty text.
    """
    if not approved_claims:
        return GroundedExplanation(
            explanation_text=UNCERTAIN_TEXT,
            cited_claim_ids=[],
            cited_chunk_ids=[],
            confidence_label="UNCERTAIN",
        )

    # Collect unique sources
    source_ids = set()
    for chunk in chunks:
        sid = chunk.get("source_document_id") or chunk.get("sourceDocumentId")
        if sid:
            source_ids.add(sid)

    confidence_label = _determine_confidence_label(len(approved_claims), len(source_ids))

    claims_text = "\n".join(
        f"[{c.get('id', f'claim-{i}')}] {c.get('claim_text', c.get('claimText', ''))}"
        for i, c in enumerate(approved_claims)
    )

    chunks_text = "\n\n".join(
        f"[{c.get('chunk_id', c.get('chunkId', f'chunk-{i}'))}] {c.get('chunk_text', c.get('chunkText', ''))}"
        for i, c in enumerate(chunks)
    )

    client = _get_client()
    prompt = GROUNDING_PROMPT.format(
        entity_id=entity_id,
        claims_text=claims_text,
        chunks_text=chunks_text,
    )

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )

    explanation_text = response.choices[0].message.content or ""

    cited_claim_ids = [
        c.get("id", f"claim-{i}")
        for i, c in enumerate(approved_claims)
    ]
    cited_chunk_ids = [
        c.get("chunk_id", c.get("chunkId", f"chunk-{i}"))
        for i, c in enumerate(chunks)
    ]

    return GroundedExplanation(
        explanation_text=explanation_text,
        cited_claim_ids=cited_claim_ids,
        cited_chunk_ids=cited_chunk_ids,
        confidence_label=confidence_label,
    )
