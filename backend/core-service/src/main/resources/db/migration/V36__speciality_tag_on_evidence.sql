ALTER TABLE source_documents
    ADD COLUMN IF NOT EXISTS speciality_canonical_id VARCHAR(100);

ALTER TABLE candidate_claims
    ADD COLUMN IF NOT EXISTS speciality_canonical_id VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_source_documents_speciality
    ON source_documents (speciality_canonical_id);

CREATE INDEX IF NOT EXISTS idx_candidate_claims_speciality
    ON candidate_claims (speciality_canonical_id);
