package dev.traced.core.multiplayer.dto;

import lombok.Builder;

@Builder
public record ParticipantDto(
    String participantId,
    String userProfileId,
    String displayName,
    int score,
    Integer rank
) {}
