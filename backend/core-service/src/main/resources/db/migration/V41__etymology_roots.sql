-- Sprint 15: etymology root + per-user collection.

CREATE TABLE etymology_roots (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    root               VARCHAR(100) NOT NULL UNIQUE,
    origin_language    VARCHAR(20)  NOT NULL, -- Greek | Latin | Arabic | Eponym
    meaning            TEXT         NOT NULL,
    example_structures TEXT[]       NOT NULL DEFAULT '{}',
    example_usage      TEXT         NOT NULL,
    illustration_url   TEXT,
    created_at         TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE user_etymology_collection (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES users(id),
    root_id      UUID NOT NULL REFERENCES etymology_roots(id),
    collected_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, root_id)
);

CREATE INDEX idx_user_etymology_user ON user_etymology_collection (user_id);

-- Retrofit the FK that Sprint 7 deferred.
ALTER TABLE daily_lesson_progress
    ADD CONSTRAINT fk_lesson_etymology_root
        FOREIGN KEY (etymology_root_id) REFERENCES etymology_roots(id);
