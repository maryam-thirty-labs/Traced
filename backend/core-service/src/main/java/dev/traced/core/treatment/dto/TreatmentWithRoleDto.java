package dev.traced.core.treatment.dto;

import dev.traced.core.relation.entity.DiseaseTreatmentRelation;
import lombok.Builder;

@Builder
public record TreatmentWithRoleDto(
    String canonicalId,
    String name,
    String treatmentClass,
    String treatmentRole,
    Integer lineOfTherapy
) {
    public static TreatmentWithRoleDto from(DiseaseTreatmentRelation rel) {
        return TreatmentWithRoleDto.builder()
            .canonicalId(rel.getTreatment().getCanonicalId())
            .name(rel.getTreatment().getName())
            .treatmentClass(rel.getTreatment().getTreatmentClass())
            .treatmentRole(rel.getTreatmentRole())
            .lineOfTherapy(rel.getLineOfTherapy())
            .build();
    }
}
