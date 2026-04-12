package dev.traced.core.disease.controller;

import dev.traced.core.disease.dto.DiseaseDetailDto;
import dev.traced.core.disease.dto.DiseaseSymptomDto;
import dev.traced.core.disease.service.DiseaseService;
import dev.traced.core.treatment.dto.TreatmentWithRoleDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/diseases")
@RequiredArgsConstructor
public class DiseaseController {

    private final DiseaseService diseaseService;

    @GetMapping("/{canonicalId}")
    public ResponseEntity<DiseaseDetailDto> getDisease(
        @PathVariable String canonicalId
    ) {
        var disease = diseaseService.findByCanonicalId(canonicalId);
        var aliases = diseaseService.findAliases(canonicalId);
        return ResponseEntity.ok(DiseaseDetailDto.from(disease, aliases));
    }

    @GetMapping("/{canonicalId}/treatments")
    public ResponseEntity<List<TreatmentWithRoleDto>> getDiseaseTreatments(
        @PathVariable String canonicalId
    ) {
        var relations = diseaseService.findTreatmentRelations(canonicalId);
        return ResponseEntity.ok(relations.stream().map(TreatmentWithRoleDto::from).toList());
    }

    @GetMapping("/{canonicalId}/symptoms")
    public ResponseEntity<List<DiseaseSymptomDto>> getDiseaseSymptoms(
        @PathVariable String canonicalId
    ) {
        var symptoms = diseaseService.findSymptoms(canonicalId);
        return ResponseEntity.ok(symptoms.stream().map(DiseaseSymptomDto::from).toList());
    }
}
