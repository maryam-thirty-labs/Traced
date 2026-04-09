CREATE TABLE disease_aliases (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disease_id UUID         NOT NULL REFERENCES diseases(id),
    alias      VARCHAR(255) NOT NULL,
    alias_type VARCHAR(20)  NOT NULL
);
