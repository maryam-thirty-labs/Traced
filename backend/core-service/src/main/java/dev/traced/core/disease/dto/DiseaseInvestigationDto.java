package dev.traced.core.disease.dto;

import dev.traced.core.disease.entity.DiseaseInvestigation;

public record DiseaseInvestigationDto(
    String investigationName,
    String rationale,
    Integer displayOrder
) {
    public static DiseaseInvestigationDto from(DiseaseInvestigation i) {
        return new DiseaseInvestigationDto(
            i.getInvestigationName(),
            i.getRationale(),
            i.getDisplayOrder()
        );
    }
}
