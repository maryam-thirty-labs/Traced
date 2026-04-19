package dev.traced.core.lesson.dto;

import lombok.Builder;

import java.util.List;
import java.util.UUID;

@Builder
public record NextActionDto(
    boolean lessonAvailableToday,
    boolean lessonCompleted,
    int streakDays,
    NextRootPreview nextRootPreview,
    UUID currentSystemId,
    List<UUID> exploredStructureIds,
    List<String> exploredCanonicalIds,
    boolean onboardingCompleted
) {
    @Builder
    public record NextRootPreview(
        String root,
        String origin,
        String meaning
    ) {}
}
