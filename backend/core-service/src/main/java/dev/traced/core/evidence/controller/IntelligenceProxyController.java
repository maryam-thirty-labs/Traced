package dev.traced.core.evidence.controller;

import dev.traced.core.evidence.dto.AdaptiveExplanationRequestDto;
import dev.traced.core.evidence.dto.AdaptiveExplanationResponseDto;
import dev.traced.core.evidence.service.AdaptiveExplanationProxy;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Core-service proxy for intelligence-service endpoints.
 *
 * Frontend never calls FastAPI directly (CLAUDE.md, non-negotiable). This
 * proxy is the only entry point the frontend uses for adaptive explanations.
 */
@RestController
@RequestMapping("/api/intelligence")
@RequiredArgsConstructor
public class IntelligenceProxyController {

    private final AdaptiveExplanationProxy proxy;

    @PostMapping("/explanations/adaptive")
    public ResponseEntity<AdaptiveExplanationResponseDto> adaptiveExplanation(
        @Valid @RequestBody AdaptiveExplanationRequestDto request
    ) {
        return ResponseEntity.ok(proxy.adapt(request.structureId(), request.userBackground()));
    }
}
