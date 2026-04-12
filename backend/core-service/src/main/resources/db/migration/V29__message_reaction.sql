CREATE TABLE message_reactions (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id       UUID        NOT NULL REFERENCES chat_messages(id),
    user_profile_id  UUID        NOT NULL REFERENCES user_profiles(id),
    reaction_emoji   VARCHAR(16) NOT NULL,
    UNIQUE (message_id, user_profile_id, reaction_emoji)
);

CREATE INDEX idx_message_reactions_message ON message_reactions (message_id);
