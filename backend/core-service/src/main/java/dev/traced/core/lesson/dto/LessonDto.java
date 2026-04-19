package dev.traced.core.lesson.dto;

import lombok.Builder;

import java.util.List;
import java.util.UUID;

@Builder
public record LessonDto(
    UUID lessonId,
    String lessonDate,
    boolean completed,
    List<RetrievalItemDto> retrieval,
    ExploreItemDto explore,
    int expectedXp
) {
    @Builder
    public record RetrievalItemDto(
        UUID structureId,
        String canonicalId,
        String displayName,
        List<AnswerOptionDto> options,
        int displayOrder
    ) {}

    @Builder
    public record AnswerOptionDto(
        String text,
        boolean correct
    ) {}

    @Builder
    public record ExploreItemDto(
        UUID structureId,
        String canonicalId,
        String displayName,
        String system,
        UUID etymologyRootId,
        String etymologyPreviewRoot
    ) {}
}
