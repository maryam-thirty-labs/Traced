package dev.traced.core.profile.dto;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Builder
public record ProgressDto(
    int totalXp,
    int currentLevel,
    int xpToNextLevel,
    List<MasteryDto> masteryRecords,
    List<RecentAttemptDto> recentAttempts,
    String suggestedNext
) {
    @Builder
    public record MasteryDto(
        String systemCanonicalId,
        BigDecimal masteryPct,
        int casesAttempted,
        int casesCorrect
    ) {}

    @Builder
    public record RecentAttemptDto(
        String caseId,
        String caseTitle,
        String outcome,
        int score,
        int xpAwarded,
        LocalDateTime completedAt
    ) {}
}
