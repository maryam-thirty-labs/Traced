package dev.traced.core.profile.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record UserProfileDto(
    String displayName,
    int totalXp,
    int currentLevel,
    String levelTitle,
    int currentStreak,
    List<String> unlockedSystems,
    boolean etymologyEnabled
) {}
