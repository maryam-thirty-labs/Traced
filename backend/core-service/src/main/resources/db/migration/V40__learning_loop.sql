-- Sprint 7: data model for the daily lesson loop and progressive home.
-- `learning_activated` is the flag that unlocks full nav. Backend-owned.
-- `current_system_id` tracks the user's position on the Cardiovascular → Respiratory
-- → Nervous → Digestive → Musculoskeletal system path.
ALTER TABLE user_profiles
    ADD COLUMN IF NOT EXISTS learning_activated BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS current_system_id  UUID REFERENCES body_systems(id);

-- Daily lesson header (one row per user per day).
CREATE TABLE daily_lesson_progress (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            UUID NOT NULL REFERENCES users(id),
    lesson_date        DATE NOT NULL,
    structure_explored UUID REFERENCES anatomy_parts(id),
    -- etymology_root_id references etymology_roots(id), added by Sprint 15's migration.
    etymology_root_id  UUID,
    completed          BOOLEAN NOT NULL DEFAULT FALSE,
    xp_awarded         INT NOT NULL DEFAULT 0,
    completed_at       TIMESTAMP,
    created_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, lesson_date)
);

CREATE INDEX idx_daily_lesson_progress_user ON daily_lesson_progress (user_id, lesson_date DESC);

-- Per-item retrieval log. Replaces a UUID[] array to enable per-item analytics.
CREATE TABLE daily_lesson_retrieval_items (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id          UUID NOT NULL REFERENCES daily_lesson_progress(id) ON DELETE CASCADE,
    structure_id       UUID NOT NULL REFERENCES anatomy_parts(id),
    answered_correctly BOOLEAN,
    answered_at        TIMESTAMP,
    display_order      INT NOT NULL
);

CREATE INDEX idx_retrieval_items_lesson ON daily_lesson_retrieval_items (lesson_id);

-- Per-user, per-structure progression. Written only by LearningLoopService.
-- `explored_at` is set when the etymology dwell threshold is met.
-- `first_source` records where the user first encountered the structure
-- (LESSON | EXPLORER | CASE); it is set once and never updated.
CREATE TABLE anatomy_structure_progress (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES users(id),
    structure_id      UUID NOT NULL REFERENCES anatomy_parts(id),
    first_seen_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    explored_at       TIMESTAMP,
    last_explored_at  TIMESTAMP,
    last_reviewed_at  TIMESTAMP,
    review_count      INT NOT NULL DEFAULT 0,
    first_source      VARCHAR(20) NOT NULL DEFAULT 'LESSON',
    UNIQUE(user_id, structure_id)
);

CREATE INDEX idx_structure_progress_user ON anatomy_structure_progress (user_id);
