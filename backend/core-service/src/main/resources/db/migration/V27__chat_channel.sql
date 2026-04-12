CREATE TABLE chat_channels (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id          VARCHAR(64)  NOT NULL UNIQUE,
    display_name        VARCHAR(255) NOT NULL,
    created_by_user_id  UUID REFERENCES users(id),
    created_at          TIMESTAMP    NOT NULL DEFAULT now(),
    status              VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE'
);

-- Seed 5 default channels (idempotent)
INSERT INTO chat_channels (channel_id, display_name, status)
VALUES
    ('general',          'General',          'ACTIVE'),
    ('digestive-system', 'Digestive System', 'ACTIVE'),
    ('cardio',           'Cardio',           'ACTIVE'),
    ('mystery-cases',    'Mystery Cases',    'ACTIVE'),
    ('study-tips',       'Study Tips',       'ACTIVE')
ON CONFLICT (channel_id) DO NOTHING;
