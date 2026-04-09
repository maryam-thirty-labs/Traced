from app.services.extraction.conflict_detector import check_conflicts


def test_opposing_relation_types_high_severity():
    """Opposing relation types return hasConflict: true, severity: HIGH."""
    new_claim = {
        "subject_canonical_id": "DIS_001",
        "relation_type": "TREATED_BY",
        "object_canonical_id": "TRT_001",
        "claim_text": "Disease is treated by treatment",
    }
    existing = [{
        "id": "claim-1",
        "subject_canonical_id": "DIS_001",
        "relation_type": "CAUSED_BY",
        "object_canonical_id": "TRT_001",
        "claim_text": "Disease is caused by treatment",
    }]
    result = check_conflicts(new_claim, existing)
    assert result.has_conflict is True
    assert result.severity == "HIGH"


def test_clean_claim_no_conflict():
    """Non-conflicting claim passes."""
    new_claim = {
        "subject_canonical_id": "DIS_001",
        "relation_type": "TREATED_BY",
        "object_canonical_id": "TRT_001",
        "claim_text": "Disease is treated by treatment",
    }
    existing = [{
        "id": "claim-1",
        "subject_canonical_id": "DIS_002",
        "relation_type": "CAUSED_BY",
        "object_canonical_id": "MECH_001",
        "claim_text": "Different disease caused by mechanism",
    }]
    result = check_conflicts(new_claim, existing)
    assert result.has_conflict is False
    assert result.severity == "NONE"


def test_empty_existing_claims():
    new_claim = {
        "subject_canonical_id": "DIS_001",
        "relation_type": "TREATED_BY",
        "object_canonical_id": "TRT_001",
        "claim_text": "test",
    }
    result = check_conflicts(new_claim, [])
    assert result.has_conflict is False
