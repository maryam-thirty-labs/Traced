CREATE TABLE body_systems (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_id  VARCHAR(100) NOT NULL UNIQUE,
    name          VARCHAR(255) NOT NULL,
    display_order INTEGER      NOT NULL DEFAULT 0,
    status        VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE'
);
