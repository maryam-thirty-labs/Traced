CREATE TABLE user_profiles (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID         NOT NULL UNIQUE,
    display_name      VARCHAR(255) NOT NULL,
    joined_at         TIMESTAMP    NOT NULL DEFAULT now(),
    preferred_system  VARCHAR(100),
    etymology_enabled BOOLEAN      NOT NULL DEFAULT true,
    total_xp          INTEGER      NOT NULL DEFAULT 0,
    current_streak    INTEGER      NOT NULL DEFAULT 0,
    last_active_date  DATE
    -- No current_level column — derived by LevelService, never persisted
);
