from app.services.extraction.confidence_scorer import compute_confidence


def test_single_chunk_always_below_half():
    """Single-chunk claim always < 0.5 regardless of source trust."""
    for trust in [0.95, 0.90, 0.85, 0.80, 1.0]:
        result = compute_confidence(base_confidence=0.8, source_trust_score=trust, chunk_count=1)
        assert result.final_confidence < 0.5, (
            f"trust={trust} gave {result.final_confidence}"
        )


def test_three_guideline_chunks_high_confidence():
    """3 GUIDELINE chunks (trust 0.95) + base 0.8 → ≥ 0.75."""
    result = compute_confidence(base_confidence=0.8, source_trust_score=0.95, chunk_count=3)
    assert result.final_confidence >= 0.75


def test_one_chunk_lower_than_three_chunks():
    """1-chunk fixture produces lower confidence than 3-chunk fixture."""
    one = compute_confidence(base_confidence=0.8, source_trust_score=0.85, chunk_count=1)
    three = compute_confidence(base_confidence=0.8, source_trust_score=0.85, chunk_count=3)
    assert one.final_confidence < three.final_confidence
