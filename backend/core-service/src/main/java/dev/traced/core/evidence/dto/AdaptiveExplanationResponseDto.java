package dev.traced.core.evidence.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record AdaptiveExplanationResponseDto(
    String adaptedText,
    String ahaFact,
    List<CitedSourceDto> citations,
    String userBackgroundApplied
) {}
