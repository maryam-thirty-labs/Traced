package dev.traced.core.leaderboard.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record MyRankDto(
    LeaderboardEntryDto me,
    List<LeaderboardEntryDto> surrounding
) {}
