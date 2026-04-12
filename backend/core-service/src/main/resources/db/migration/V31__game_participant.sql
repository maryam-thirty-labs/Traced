CREATE TABLE game_participants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id         UUID      NOT NULL REFERENCES game_rooms(id),
    user_profile_id UUID      NOT NULL REFERENCES user_profiles(id),
    joined_at       TIMESTAMP NOT NULL DEFAULT now(),
    score           INTEGER   NOT NULL DEFAULT 0,
    rank            INTEGER,
    UNIQUE (room_id, user_profile_id)
);

CREATE INDEX idx_game_participants_room ON game_participants (room_id);
