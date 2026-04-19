-- Sprint 37 Step 1: user_background for adaptive explanation voice/content.
-- Four canonical values; the CHECK constraint is authoritative.
-- curious_adult | med_student | fitness | health_scare
ALTER TABLE user_profiles
    ADD COLUMN IF NOT EXISTS background VARCHAR(20) NOT NULL DEFAULT 'curious_adult'
        CHECK (background IN ('curious_adult', 'med_student', 'fitness', 'health_scare'));
