package dev.traced.core.cases.dto;

import dev.traced.core.cases.entity.*;
import lombok.Builder;

import java.util.List;

@Builder
public record CaseDetailDto(
    String caseId,
    String title,
    String subtitle,
    String difficulty,
    int xpReward,
    String linkedAnatomyId,
    VignetteDto vignette,
    List<ClueDto> clues,
    List<QuestionDto> questions
) {
    @Builder
    public record VignetteDto(
        int patientAge,
        String patientSex,
        String presentingComplaint,
        String fullVignetteText
    ) {}

    @Builder
    public record ClueDto(
        String clueType,
        String label,
        String value,
        boolean isAbnormal,
        int displayOrder
    ) {}

    @Builder
    public record QuestionDto(
        String questionId,
        int stepNumber,
        String questionText,
        String questionType,
        List<OptionDto> options
    ) {}

    @Builder
    public record OptionDto(
        String optionKey,
        String optionText
        // isCorrect intentionally omitted — server-side only
    ) {}
}
