CREATE TABLE mastery_records (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_profile_id     UUID          NOT NULL REFERENCES user_profiles(id),
    system_canonical_id VARCHAR(100)  NOT NULL,
    mastery_pct         NUMERIC(5,2)  NOT NULL DEFAULT 0,
    cases_attempted     INTEGER       NOT NULL DEFAULT 0,
    cases_correct       INTEGER       NOT NULL DEFAULT 0,
    last_updated_at     TIMESTAMP,
    UNIQUE (user_profile_id, system_canonical_id)
);
