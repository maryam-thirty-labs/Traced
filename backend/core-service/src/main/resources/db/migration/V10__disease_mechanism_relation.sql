CREATE TABLE disease_mechanism_relations (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disease_id   UUID NOT NULL REFERENCES diseases(id),
    mechanism_id UUID NOT NULL REFERENCES mechanisms(id),
    UNIQUE (disease_id, mechanism_id)
);
