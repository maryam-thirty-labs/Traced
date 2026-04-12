CREATE TABLE user_friends (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_profile_id    UUID NOT NULL REFERENCES user_profiles(id),
    friend_profile_id  UUID NOT NULL REFERENCES user_profiles(id),
    added_at           TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (user_profile_id, friend_profile_id)
);

CREATE INDEX idx_user_friends_user ON user_friends (user_profile_id);
