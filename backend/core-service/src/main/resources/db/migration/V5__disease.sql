CREATE TABLE diseases (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_id   VARCHAR(100) NOT NULL UNIQUE,
    name           VARCHAR(255) NOT NULL,
    etymology_json JSONB,
    commonness     VARCHAR(50)  NOT NULL,
    category       VARCHAR(100),
    status         VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE'
);
