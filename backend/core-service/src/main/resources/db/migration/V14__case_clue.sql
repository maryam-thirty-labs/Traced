CREATE TABLE case_clues (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id       UUID         NOT NULL REFERENCES cases(id),
    clue_type     VARCHAR(50)  NOT NULL,
    label         VARCHAR(255) NOT NULL,
    value         VARCHAR(500) NOT NULL,
    is_abnormal   BOOLEAN      NOT NULL,
    display_order INTEGER      NOT NULL,
    UNIQUE (case_id, display_order)
);
