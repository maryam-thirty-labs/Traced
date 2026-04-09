CREATE TABLE candidate_claims (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_canonical_id VARCHAR(100) NOT NULL,
    relation_type        VARCHAR(50)  NOT NULL,
    object_canonical_id  VARCHAR(100) NOT NULL,
    claim_text           TEXT         NOT NULL,
    confidence           DECIMAL(5,3) NOT NULL,
    status               VARCHAR(20)  NOT NULL DEFAULT 'CANDIDATE',
    source_chunk_ids     JSONB,
    extraction_model     VARCHAR(100),
    reviewed_at          TIMESTAMP,
    created_at           TIMESTAMP    NOT NULL DEFAULT now()
);
