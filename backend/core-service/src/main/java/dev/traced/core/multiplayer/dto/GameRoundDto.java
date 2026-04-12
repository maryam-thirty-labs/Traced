package dev.traced.core.multiplayer.dto;

import lombok.Builder;

import java.time.LocalDateTime;

/**
 * Active-round representation sent to clients.
 * Does NOT include correctAnswer — that stays server-side until ROUND_COMPLETE broadcast.
 */
@Builder
public record GameRoundDto(
    String roundId,
    int roundNumber,
    String questionPayload,
    LocalDateTime startedAt
) {}
