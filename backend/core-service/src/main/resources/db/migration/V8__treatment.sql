CREATE TABLE treatments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_id    VARCHAR(100) NOT NULL UNIQUE,
    name            VARCHAR(255) NOT NULL,
    treatment_class VARCHAR(100),
    status          VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE'
);
