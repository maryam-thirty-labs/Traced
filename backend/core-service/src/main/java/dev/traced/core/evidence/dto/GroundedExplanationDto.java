package dev.traced.core.evidence.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record GroundedExplanationDto(
    String explanationText,
    List<String> citedClaimIds,
    List<String> citedChunkIds,
    String confidenceLabel
) {}
