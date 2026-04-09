CREATE TABLE anatomy_synonyms (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anatomy_part_id UUID         NOT NULL REFERENCES anatomy_parts(id),
    synonym         VARCHAR(255) NOT NULL,
    synonym_type    VARCHAR(20)  NOT NULL
);
