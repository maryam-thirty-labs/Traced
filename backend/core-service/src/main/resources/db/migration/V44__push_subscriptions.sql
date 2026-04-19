-- Sprint 27: web push subscriptions + reminder-time preference.
CREATE TABLE user_push_subscriptions (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES users(id),
    endpoint         TEXT NOT NULL,
    p256dh_key       TEXT NOT NULL,
    auth_key         TEXT NOT NULL,
    user_agent       TEXT,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, endpoint)
);

CREATE INDEX idx_push_subscriptions_user ON user_push_subscriptions (user_id);

ALTER TABLE user_profiles
    ADD COLUMN IF NOT EXISTS reminder_time       VARCHAR(8),      -- "07:00" | "09:00" | "12:00" | "18:00" | "21:00"
    ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN NOT NULL DEFAULT FALSE;
