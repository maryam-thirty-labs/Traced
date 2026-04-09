CREATE TABLE disease_treatment_relations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disease_id      UUID        NOT NULL REFERENCES diseases(id),
    treatment_id    UUID        NOT NULL REFERENCES treatments(id),
    treatment_role  VARCHAR(30) NOT NULL,
    line_of_therapy INTEGER,
    UNIQUE (disease_id, treatment_id, treatment_role)
);
