package dev.traced.core.anatomy.dto;

import lombok.Builder;

import java.util.UUID;

@Builder
public record BodySystemSummaryDto(
    UUID id,
    String canonicalId,
    String name,
    int displayOrder,
    int structureCount,
    int exploredCount
) {}
