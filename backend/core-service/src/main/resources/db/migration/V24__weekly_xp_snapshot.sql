CREATE TABLE weekly_xp_snapshots (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_profile_id      UUID    NOT NULL REFERENCES user_profiles(id),
    week_start_date      DATE    NOT NULL,
    xp_earned_this_week  INTEGER NOT NULL DEFAULT 0,
    rank_this_week       INTEGER,
    archived             BOOLEAN NOT NULL DEFAULT false,
    created_at           TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (user_profile_id, week_start_date)
);

CREATE INDEX idx_weekly_xp_snapshots_week_archived
    ON weekly_xp_snapshots (week_start_date, archived);
