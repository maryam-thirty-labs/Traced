CREATE TABLE case_options (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID         NOT NULL REFERENCES case_questions(id),
    option_key  VARCHAR(10)  NOT NULL,
    option_text VARCHAR(500) NOT NULL,
    is_correct  BOOLEAN      NOT NULL,
    UNIQUE (question_id, option_key)
);
