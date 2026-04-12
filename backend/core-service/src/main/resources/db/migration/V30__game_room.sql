CREATE TABLE game_rooms (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code            VARCHAR(6)   NOT NULL UNIQUE,
    host_profile_id      UUID         NOT NULL REFERENCES user_profiles(id),
    status               VARCHAR(20)  NOT NULL DEFAULT 'WAITING',
    game_mode            VARCHAR(30)  NOT NULL,
    difficulty           VARCHAR(20)  NOT NULL,
    system_canonical_id  VARCHAR(100),
    created_at           TIMESTAMP    NOT NULL DEFAULT now(),
    completed_at         TIMESTAMP
);

CREATE INDEX idx_game_rooms_status_mode ON game_rooms (status, game_mode, difficulty);
