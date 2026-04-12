package dev.traced.core.chat.dto;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.Map;

@Builder
public record ChatMessageDto(
    String messageId,
    String channelId,
    String authorDisplayName,
    String messageText,
    LocalDateTime sentAt,
    Map<String, Integer> reactionCounts
) {}
