package dev.traced.core.chat.service;

import dev.traced.core.chat.entity.ChatMessage;
import dev.traced.core.chat.entity.MessageReaction;
import dev.traced.core.chat.repository.ChatMessageRepository;
import dev.traced.core.chat.repository.MessageReactionRepository;
import dev.traced.core.common.EntityNotFoundException;
import dev.traced.core.profile.entity.UserProfile;
import dev.traced.core.profile.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MessageReactionService {

    public static final Set<String> ALLOWED_EMOJIS = Set.of(
        "fire", "brain", "check", "laugh", "question", "heart"
    );

    private final MessageReactionRepository reactionRepository;
    private final ChatMessageRepository messageRepository;
    private final UserProfileRepository userProfileRepository;

    public static void validateEmoji(String emoji) {
        if (emoji == null || !ALLOWED_EMOJIS.contains(emoji)) {
            throw new IllegalArgumentException(
                "reactionEmoji must be one of: " + ALLOWED_EMOJIS + ", got: " + emoji
            );
        }
    }

    @Transactional
    public MessageReaction addReaction(UUID messageId, UUID userProfileId, String emoji) {
        validateEmoji(emoji);

        if (reactionRepository.existsByMessageIdAndUserProfileIdAndReactionEmoji(messageId, userProfileId, emoji)) {
            throw new DataIntegrityViolationException("Reaction already exists");
        }

        ChatMessage message = messageRepository.findById(messageId)
            .orElseThrow(() -> new EntityNotFoundException("ChatMessage", messageId.toString()));
        UserProfile profile = userProfileRepository.findById(userProfileId)
            .orElseThrow(() -> new EntityNotFoundException("UserProfile", userProfileId.toString()));

        MessageReaction reaction = MessageReaction.builder()
            .message(message)
            .userProfile(profile)
            .reactionEmoji(emoji)
            .build();
        return reactionRepository.save(reaction);
    }
}
