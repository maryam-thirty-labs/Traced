package dev.traced.core.lesson.dto;

import lombok.Builder;

import java.util.UUID;

@Builder
public record LessonCompletionDto(
    int xpAwarded,
    int newXp,
    int streakDays,
    UUID etymologyRootId,
    boolean onboardingCompleted
) {}
