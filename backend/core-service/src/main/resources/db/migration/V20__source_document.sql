CREATE TABLE source_documents (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url          VARCHAR(2048) NOT NULL UNIQUE,
    title        VARCHAR(500)  NOT NULL,
    source_type  VARCHAR(50)   NOT NULL,
    trust_score  DECIMAL(4,2)  NOT NULL,
    jurisdiction VARCHAR(50),
    raw_text     TEXT,
    ingested_at  TIMESTAMP     NOT NULL DEFAULT now(),
    status       VARCHAR(20)   NOT NULL DEFAULT 'ACTIVE'
);
