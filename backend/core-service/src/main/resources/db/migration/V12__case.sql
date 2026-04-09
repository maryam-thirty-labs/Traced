CREATE TABLE cases (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id           VARCHAR(100) NOT NULL UNIQUE,
    title             VARCHAR(255) NOT NULL,
    subtitle          VARCHAR(500),
    linked_anatomy_id UUID         NOT NULL REFERENCES anatomy_parts(id),
    linked_disease_id UUID         NOT NULL REFERENCES diseases(id),
    difficulty        VARCHAR(20)  NOT NULL,
    estimated_minutes INTEGER,
    xp_reward         INTEGER      NOT NULL,
    status            VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE'
);
