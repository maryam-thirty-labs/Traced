package dev.traced.core.chat.dto;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record ChatChannelDto(
    String channelId,
    String displayName,
    long messageCount,
    LocalDateTime lastActivityAt
) {}
