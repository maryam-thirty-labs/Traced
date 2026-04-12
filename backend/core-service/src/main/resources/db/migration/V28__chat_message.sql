CREATE TABLE chat_messages (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id         UUID         NOT NULL REFERENCES chat_channels(id),
    author_profile_id  UUID         NOT NULL REFERENCES user_profiles(id),
    message_text       VARCHAR(500) NOT NULL,
    sent_at            TIMESTAMP    NOT NULL DEFAULT now(),
    status             VARCHAR(20)  NOT NULL DEFAULT 'VISIBLE'
);

CREATE INDEX idx_chat_messages_channel_sent
    ON chat_messages (channel_id, sent_at DESC);
