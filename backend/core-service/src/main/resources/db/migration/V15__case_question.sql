CREATE TABLE case_questions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id       UUID         NOT NULL REFERENCES cases(id),
    step_number   INTEGER      NOT NULL,
    question_text TEXT         NOT NULL,
    question_type VARCHAR(50)  NOT NULL,
    UNIQUE (case_id, step_number)
);
