CREATE TABLE game_answers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    round_id        UUID      NOT NULL REFERENCES game_rounds(id),
    participant_id  UUID      NOT NULL REFERENCES game_participants(id),
    answer_value    TEXT      NOT NULL,
    is_correct      BOOLEAN   NOT NULL,
    answered_at     TIMESTAMP NOT NULL DEFAULT now(),
    points_awarded  INTEGER   NOT NULL,
    UNIQUE (round_id, participant_id)
);

CREATE INDEX idx_game_answers_round ON game_answers (round_id);
