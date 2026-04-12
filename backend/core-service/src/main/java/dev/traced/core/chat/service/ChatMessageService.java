package dev.traced.core.chat.service;

import dev.traced.core.chat.entity.ChatChannel;
import dev.traced.core.chat.entity.ChatMessage;
import dev.traced.core.chat.repository.ChatMessageRepository;
import dev.traced.core.common.EntityNotFoundException;
import dev.traced.core.profile.entity.UserProfile;
import dev.traced.core.profile.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatMessageService {

    public static final int MAX_MESSAGE_LENGTH = 500;
    public static final int DEFAULT_PAGE_SIZE = 50;

    private final ChatMessageRepository messageRepository;
    private final ChatChannelService channelService;
    private final UserProfileRepository userProfileRepository;

    public static void validateText(String text) {
        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("messageText must not be empty");
        }
        if (text.length() > MAX_MESSAGE_LENGTH) {
            throw new IllegalArgumentException(
                "messageText must be <= " + MAX_MESSAGE_LENGTH + " characters, got " + text.length()
            );
        }
    }

    public List<ChatMessage> listMessages(String channelId, LocalDateTime before, int limit) {
        ChatChannel channel = channelService.findByChannelId(channelId);
        int size = Math.min(Math.max(limit, 1), DEFAULT_PAGE_SIZE);
        var pageable = PageRequest.of(0, size);
        return before != null
            ? messageRepository.findVisibleByChannelBefore(channel.getId(), before, pageable)
            : messageRepository.findVisibleByChannel(channel.getId(), pageable);
    }

    public ChatMessage findById(UUID messageId) {
        return messageRepository.findById(messageId)
            .orElseThrow(() -> new EntityNotFoundException("ChatMessage", messageId.toString()));
    }

    @Transactional
    public ChatMessage send(String channelId, UUID authorProfileId, String messageText) {
        validateText(messageText);
        ChatChannel channel = channelService.findByChannelId(channelId);
        UserProfile author = userProfileRepository.findById(authorProfileId)
            .orElseThrow(() -> new EntityNotFoundException("UserProfile", authorProfileId.toString()));

        ChatMessage message = ChatMessage.builder()
            .channel(channel)
            .authorProfile(author)
            .messageText(messageText.trim())
            .status("VISIBLE")
            .build();
        return messageRepository.save(message);
    }
}
