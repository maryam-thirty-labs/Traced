CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE evidence_chunks (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chunk_id           VARCHAR(200) NOT NULL UNIQUE,
    source_document_id UUID         NOT NULL REFERENCES source_documents(id),
    chunk_text         TEXT         NOT NULL,
    section_title      VARCHAR(500),
    chunk_order        INTEGER      NOT NULL,
    embedding          vector(1536)
);

CREATE INDEX idx_evidence_chunks_embedding ON evidence_chunks
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 10);
