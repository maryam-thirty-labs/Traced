package dev.traced.core.evidence.controller;

import dev.traced.core.evidence.dto.GroundedExplanationDto;
import dev.traced.core.evidence.service.ExplanationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/explanations")
@RequiredArgsConstructor
public class ExplanationController {

    private final ExplanationService explanationService;

    @PostMapping("/anatomy")
    public ResponseEntity<GroundedExplanationDto> getAnatomyExplanation(
        @RequestBody Map<String, String> request
    ) {
        String canonicalId = request.get("canonicalId");
        if (canonicalId == null || canonicalId.isBlank()) {
            throw new IllegalArgumentException("canonicalId is required");
        }
        return ResponseEntity.ok(explanationService.generateExplanation(canonicalId));
    }
}
