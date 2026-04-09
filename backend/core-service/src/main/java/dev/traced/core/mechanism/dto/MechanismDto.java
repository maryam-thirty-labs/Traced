package dev.traced.core.mechanism.dto;

import dev.traced.core.mechanism.entity.Mechanism;
import lombok.Builder;

@Builder
public record MechanismDto(
    String canonicalId,
    String name,
    String description
) {
    public static MechanismDto from(Mechanism mechanism) {
        return MechanismDto.builder()
            .canonicalId(mechanism.getCanonicalId())
            .name(mechanism.getName())
            .description(mechanism.getDescription())
            .build();
    }
}
