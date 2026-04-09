CREATE TABLE anatomy_parts (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_id  VARCHAR(100) NOT NULL UNIQUE,
    display_name  VARCHAR(255) NOT NULL,
    system_id     UUID         NOT NULL REFERENCES body_systems(id),
    region        VARCHAR(255) NOT NULL,
    overview      TEXT,
    status        VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE'
);
