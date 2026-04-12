ALTER TABLE user_profiles
    ADD COLUMN IF NOT EXISTS university VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_user_profiles_university_lower
    ON user_profiles (LOWER(university));
