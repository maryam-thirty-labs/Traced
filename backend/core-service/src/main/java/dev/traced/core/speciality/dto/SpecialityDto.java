package dev.traced.core.speciality.dto;

import lombok.Builder;

@Builder
public record SpecialityDto(
    String canonicalId,
    String name,
    String displayName,
    String focusDescription
) {}
