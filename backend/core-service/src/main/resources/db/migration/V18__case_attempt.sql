CREATE TABLE case_attempts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_profile_id UUID        NOT NULL REFERENCES user_profiles(id),
    case_id         UUID        NOT NULL REFERENCES cases(id),
    started_at      TIMESTAMP   NOT NULL DEFAULT now(),
    completed_at    TIMESTAMP,
    outcome         VARCHAR(20) NOT NULL,
    xp_awarded      INTEGER     NOT NULL,
    score           INTEGER     NOT NULL
    -- No unique on (user_profile_id, case_id) — multiple attempts allowed
);
