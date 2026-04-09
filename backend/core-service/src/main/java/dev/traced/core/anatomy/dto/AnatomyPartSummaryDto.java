package dev.traced.core.anatomy.dto;

import dev.traced.core.anatomy.entity.AnatomyPart;
import lombok.Builder;

@Builder
public record AnatomyPartSummaryDto(
    String canonicalId,
    String displayName,
    String system,
    String region,
    String overview,
    String status
) {
    public static AnatomyPartSummaryDto from(AnatomyPart part) {
        return AnatomyPartSummaryDto.builder()
            .canonicalId(part.getCanonicalId())
            .displayName(part.getDisplayName())
            .system(part.getSystem().getCanonicalId())
            .region(part.getRegion())
            .overview(part.getOverview())
            .status(part.getStatus())
            .build();
    }
}
