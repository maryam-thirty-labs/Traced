from pydantic import BaseModel

# Opposing relation type pairs
OPPOSING_PAIRS: list[tuple[str, str]] = [
    ("CAUSED_BY", "TARGETS"),
    ("TREATED_BY", "CAUSED_BY"),
]


class ConflictResult(BaseModel):
    has_conflict: bool
    conflicting_claim_ids: list[str]
    severity: str  # HIGH, MEDIUM, LOW, NONE


def check_conflicts(
    new_claim: dict,
    existing_claims: list[dict],
) -> ConflictResult:
    """
    Check if a new claim conflicts with existing approved claims.
    Opposing relation types on the same subject-object pair → HIGH severity.
    Same triple with contradicting claim text → MEDIUM.
    """
    new_subject = new_claim.get("subject_canonical_id", "")
    new_object = new_claim.get("object_canonical_id", "")
    new_relation = new_claim.get("relation_type", "")

    conflicting_ids: list[str] = []
    max_severity = "NONE"

    for existing in existing_claims:
        ex_subject = existing.get("subject_canonical_id", "")
        ex_object = existing.get("object_canonical_id", "")
        ex_relation = existing.get("relation_type", "")
        ex_id = existing.get("id", "")

        # Same subject-object pair
        if ex_subject == new_subject and ex_object == new_object:
            # Check for opposing relation types
            pair = (new_relation, ex_relation)
            reverse_pair = (ex_relation, new_relation)

            if pair in OPPOSING_PAIRS or reverse_pair in OPPOSING_PAIRS:
                conflicting_ids.append(ex_id)
                max_severity = "HIGH"
            elif ex_relation == new_relation:
                # Same triple — check for contradicting text
                new_text = new_claim.get("claim_text", "").lower()
                ex_text = existing.get("claim_text", "").lower()
                negation_words = ["not", "no ", "does not", "unlikely", "contrary", "disproven"]
                if any(w in new_text for w in negation_words) != any(w in ex_text for w in negation_words):
                    conflicting_ids.append(ex_id)
                    if max_severity != "HIGH":
                        max_severity = "MEDIUM"

        # Reversed subject-object with same relation (directional conflict)
        elif ex_subject == new_object and ex_object == new_subject and ex_relation == new_relation:
            conflicting_ids.append(ex_id)
            max_severity = "HIGH"

    return ConflictResult(
        has_conflict=len(conflicting_ids) > 0,
        conflicting_claim_ids=conflicting_ids,
        severity=max_severity,
    )
