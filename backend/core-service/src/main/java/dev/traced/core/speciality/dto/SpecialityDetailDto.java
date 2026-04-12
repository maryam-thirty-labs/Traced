package dev.traced.core.speciality.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record SpecialityDetailDto(
    String canonicalId,
    String name,
    String displayName,
    String focusDescription,
    List<FocusAnatomyDto> focusAnatomy
) {
    @Builder
    public record FocusAnatomyDto(
        String anatomyCanonicalId,
        String displayName,
        String focusReason,
        String clinicalRelevance
    ) {}
}
