package dev.traced.core.cases.dto;

import lombok.Builder;

@Builder
public record CaseSummaryDto(
    String caseId,
    String title,
    String subtitle,
    String difficulty,
    int xpReward
) {}
