package dev.traced.core.chat.repository;

import dev.traced.core.chat.entity.MessageReaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MessageReactionRepository extends JpaRepository<MessageReaction, UUID> {
    List<MessageReaction> findByMessageIdIn(List<UUID> messageIds);
    boolean existsByMessageIdAndUserProfileIdAndReactionEmoji(UUID messageId, UUID userProfileId, String reactionEmoji);
}
