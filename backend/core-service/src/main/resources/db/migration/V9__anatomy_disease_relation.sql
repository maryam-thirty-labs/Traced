CREATE TABLE anatomy_disease_relations (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anatomy_part_id   UUID        NOT NULL REFERENCES anatomy_parts(id),
    disease_id        UUID        NOT NULL REFERENCES diseases(id),
    relation_strength VARCHAR(20) NOT NULL,
    UNIQUE (anatomy_part_id, disease_id)
);
