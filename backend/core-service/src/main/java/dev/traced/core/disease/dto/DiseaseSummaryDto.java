package dev.traced.core.disease.dto;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.traced.core.disease.entity.Disease;
import lombok.Builder;

import java.util.List;
import java.util.Map;

@Builder
public record DiseaseSummaryDto(
    String canonicalId,
    String name,
    List<Map<String, String>> etymology,
    String commonness,
    String category
) {
    private static final ObjectMapper MAPPER = new ObjectMapper();

    public static DiseaseSummaryDto from(Disease disease) {
        List<Map<String, String>> etymology = List.of();
        if (disease.getEtymologyJson() != null) {
            try {
                etymology = MAPPER.readValue(
                    disease.getEtymologyJson(),
                    new TypeReference<>() {}
                );
            } catch (Exception ignored) {}
        }

        return DiseaseSummaryDto.builder()
            .canonicalId(disease.getCanonicalId())
            .name(disease.getName())
            .etymology(etymology)
            .commonness(disease.getCommonness())
            .category(disease.getCategory())
            .build();
    }
}
