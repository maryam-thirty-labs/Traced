import pytest
from app.services.grounding.grounding_service import generate_explanation


@pytest.mark.asyncio
async def test_zero_claims_returns_uncertain():
    """0 approved claims → UNCERTAIN label."""
    result = await generate_explanation("ANAT_TEST_001", [], [])
    assert result.confidence_label == "UNCERTAIN"
    assert result.cited_claim_ids == []


@pytest.mark.asyncio
async def test_uncertain_contains_no_medical_assertions():
    """UNCERTAIN output has no fabricated medical assertions."""
    result = await generate_explanation("ANAT_TEST_001", [], [])
    text = result.explanation_text.lower()
    # Should contain uncertainty language
    assert "insufficient" in text or "uncertainty" in text or "insufficient" in text
    # Should not contain specific medical claims
    assert "cholecystectomy" not in text
    assert "gallstone" not in text
