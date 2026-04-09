from pydantic import BaseModel


class ConfidenceScore(BaseModel):
    final_confidence: float
    base_confidence: float
    source_trust: float
    coverage_factor: float


def compute_confidence(
    base_confidence: float,
    source_trust_score: float,
    chunk_count: int,
) -> ConfidenceScore:
    """
    final_confidence = base_confidence * source_trust_score * coverage_factor
    coverage_factor = min(chunk_count / 3, 1.0)

    Single-chunk claim: coverage_factor ≈ 0.33 → always < 0.5 regardless of source trust.
    """
    coverage_factor = min(chunk_count / 3.0, 1.0)
    final = base_confidence * source_trust_score * coverage_factor
    final = round(min(final, 1.0), 4)

    return ConfidenceScore(
        final_confidence=final,
        base_confidence=base_confidence,
        source_trust=source_trust_score,
        coverage_factor=round(coverage_factor, 4),
    )
