package dev.traced.core.leaderboard.dto;

import lombok.Builder;

@Builder
public record LeaderboardEntryDto(
    int rank,
    String displayName,
    int xp,
    int currentLevel,
    int currentStreak,
    String university,
    boolean isMe
) {}
