package dev.traced.core.multiplayer.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record GameRoomDto(
    String roomCode,
    String status,
    String gameMode,
    String difficulty,
    String systemCanonicalId,
    String hostProfileId,
    List<ParticipantDto> participants
) {}
