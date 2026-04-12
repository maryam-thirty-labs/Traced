package dev.traced.core.chat.service;

import dev.traced.core.auth.entity.User;
import dev.traced.core.auth.repository.UserRepository;
import dev.traced.core.chat.entity.ChatChannel;
import dev.traced.core.chat.repository.ChatChannelRepository;
import dev.traced.core.common.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ChatChannelService {

    private static final Pattern SLUG_PATTERN = Pattern.compile("^[a-z0-9]+(-[a-z0-9]+)*$");

    private final ChatChannelRepository channelRepository;
    private final UserRepository userRepository;

    public static void validateSlug(String slug) {
        if (slug == null || slug.isBlank()) {
            throw new IllegalArgumentException("channelId is required");
        }
        if (!SLUG_PATTERN.matcher(slug).matches()) {
            throw new IllegalArgumentException(
                "channelId must be lowercase alphanumeric with hyphens only, got: " + slug
            );
        }
    }

    public static String toSlug(String displayName) {
        if (displayName == null) return "";
        return displayName.trim().toLowerCase()
            .replaceAll("[^a-z0-9\\s-]", "")
            .replaceAll("\\s+", "-")
            .replaceAll("-+", "-")
            .replaceAll("^-|-$", "");
    }

    public List<ChatChannel> listActive() {
        return channelRepository.findByStatus("ACTIVE");
    }

    public ChatChannel findByChannelId(String channelId) {
        return channelRepository.findByChannelId(channelId)
            .orElseThrow(() -> new EntityNotFoundException("ChatChannel", channelId));
    }

    @Transactional
    public ChatChannel create(String channelId, String displayName, UUID createdByUserId) {
        validateSlug(channelId);
        if (displayName == null || displayName.isBlank()) {
            throw new IllegalArgumentException("displayName is required");
        }

        if (channelRepository.existsByChannelId(channelId)) {
            throw new DataIntegrityViolationException("Channel already exists: " + channelId);
        }

        User user = userRepository.findById(createdByUserId)
            .orElseThrow(() -> new EntityNotFoundException("User", createdByUserId.toString()));

        ChatChannel channel = ChatChannel.builder()
            .channelId(channelId)
            .displayName(displayName.trim())
            .createdBy(user)
            .status("ACTIVE")
            .build();
        return channelRepository.save(channel);
    }
}
