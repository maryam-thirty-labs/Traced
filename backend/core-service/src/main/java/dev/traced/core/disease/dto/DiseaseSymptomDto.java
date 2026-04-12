package dev.traced.core.disease.dto;

import dev.traced.core.disease.entity.DiseaseSymptom;

public record DiseaseSymptomDto(
    String symptomName,
    String description,
    String severity,
    String emoji
) {
    public static DiseaseSymptomDto from(DiseaseSymptom s) {
        return new DiseaseSymptomDto(s.getSymptomName(), s.getDescription(), s.getSeverity(), s.getEmoji());
    }
}
