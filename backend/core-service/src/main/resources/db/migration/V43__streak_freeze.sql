-- Sprint 26: streak freeze mechanic — 50 XP saves streak on 1 missed day,
-- once per ISO week. Streak validity is DERIVED at read time from
-- last_active_date; no midnight cron mutates these rows.
ALTER TABLE user_profiles
    ADD COLUMN IF NOT EXISTS streak_freeze_available BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS streak_freeze_used_week INT;
