package dev.traced.core.anatomy.controller;

import dev.traced.core.anatomy.dto.AnatomyPartSummaryDto;
import dev.traced.core.anatomy.service.AnatomyService;
import dev.traced.core.disease.dto.DiseaseSummaryDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/anatomy/parts")
@RequiredArgsConstructor
public class AnatomyController {

    private final AnatomyService anatomyService;

    @GetMapping("/{canonicalId}")
    public ResponseEntity<AnatomyPartSummaryDto> getAnatomyPart(
        @PathVariable String canonicalId
    ) {
        var part = anatomyService.findByCanonicalId(canonicalId);
        return ResponseEntity.ok(AnatomyPartSummaryDto.from(part));
    }

    @GetMapping("/{canonicalId}/diseases")
    public ResponseEntity<List<DiseaseSummaryDto>> getAnatomyDiseases(
        @PathVariable String canonicalId
    ) {
        var diseases = anatomyService.findDiseasesByCanonicalId(canonicalId);
        return ResponseEntity.ok(diseases.stream().map(DiseaseSummaryDto::from).toList());
    }
}
