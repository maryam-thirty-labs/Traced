package dev.traced.core.disease.dto;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.traced.core.disease.entity.Disease;
import dev.traced.core.disease.entity.DiseaseAlias;
import lombok.Builder;

import java.util.List;
import java.util.Map;

@Builder
public record DiseaseDetailDto(
    String canonicalId,
    String name,
    List<Map<String, String>> etymology,
    String commonness,
    String category,
    String overview,
    List<AliasDto> aliases,
    String status
) {
    private static final ObjectMapper MAPPER = new ObjectMapper();

    public record AliasDto(String alias, String aliasType) {
        public static AliasDto from(DiseaseAlias a) {
            return new AliasDto(a.getAlias(), a.getAliasType());
        }
    }

    public static DiseaseDetailDto from(Disease disease, List<DiseaseAlias> aliases) {
        List<Map<String, String>> etymology = List.of();
        if (disease.getEtymologyJson() != null) {
            try {
                etymology = MAPPER.readValue(
                    disease.getEtymologyJson(),
                    new TypeReference<>() {}
                );
            } catch (Exception ignored) {}
        }

        return DiseaseDetailDto.builder()
            .canonicalId(disease.getCanonicalId())
            .name(disease.getName())
            .etymology(etymology)
            .commonness(disease.getCommonness())
            .category(disease.getCategory())
            .overview(disease.getOverview())
            .aliases(aliases.stream().map(AliasDto::from).toList())
            .status(disease.getStatus())
            .build();
    }
}
