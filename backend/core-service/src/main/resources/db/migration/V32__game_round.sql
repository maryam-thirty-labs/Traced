CREATE TABLE game_rounds (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id           UUID      NOT NULL REFERENCES game_rooms(id),
    round_number      INTEGER   NOT NULL,
    question_payload  JSONB     NOT NULL,
    correct_answer    TEXT      NOT NULL,
    started_at        TIMESTAMP NOT NULL DEFAULT now(),
    completed_at      TIMESTAMP,
    UNIQUE (room_id, round_number)
);

CREATE INDEX idx_game_rounds_room ON game_rounds (room_id);
