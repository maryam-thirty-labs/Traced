package dev.traced.core.evidence.dto;

import lombok.Builder;

@Builder
public record CitedSourceDto(
    String title,
    String sourceType,
    String jurisdiction,
    String freshness
) {}
