package dev.traced.core.cases.dto;

import lombok.Builder;

@Builder
public record WeeklyCaseResponseDto(
    boolean available,
    int streakRequired,
    int currentStreak,
    CaseDetailDto caseDetail
) {}
