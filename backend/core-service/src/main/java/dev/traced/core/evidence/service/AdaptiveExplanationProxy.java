package dev.traced.core.evidence.service;

import com.fasterxml.jackson.databind.JsonNode;
import dev.traced.core.anatomy.entity.AnatomyPart;
import dev.traced.core.anatomy.repository.AnatomyPartRepository;
import dev.traced.core.etymology.entity.EtymologyRoot;
import dev.traced.core.etymology.repository.EtymologyRootRepository;
import dev.traced.core.evidence.dto.AdaptiveExplanationResponseDto;
import dev.traced.core.evidence.dto.CitedSourceDto;
import dev.traced.core.evidence.dto.GroundedExplanationDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Thin proxy that assembles adaptive-explanation inputs from core-service's
 * own data layer and forwards to intelligence-service. Deliberately thin —
 * any business logic belongs in ExplanationService or the adaptive explainer
 * on the Python side, not here.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdaptiveExplanationProxy {

    private final ExplanationService explanationService;
    private final AnatomyPartRepository anatomyPartRepository;
    private final EtymologyRootRepository etymologyRootRepository;

    @Value("${traced.intelligence-service.url:http://localhost:8000}")
    private String intelligenceServiceUrl;

    public AdaptiveExplanationResponseDto adapt(String structureId, String userBackground) {
        // Resolve structure by canonical ID or UUID. Frontend sends canonical ID; this
        // tolerates either.
        AnatomyPart part = resolveStructure(structureId)
            .orElseThrow(() -> new IllegalArgumentException("Unknown structure: " + structureId));

        // RAG retrieval — untouched by this sprint, just invoked.
        GroundedExplanationDto grounded = explanationService.generateExplanation(part.getCanonicalId());

        String etymologyRoot = null;
        if (part.getEtymologyRootId() != null) {
            etymologyRoot = etymologyRootRepository.findById(part.getEtymologyRootId())
                .map(this::formatEtymology)
                .orElse(null);
        }

        Map<String, Object> body = new HashMap<>();
        body.put("structure_id", part.getCanonicalId());
        body.put("structure_name", part.getDisplayName());
        body.put("clinical_text", grounded.explanationText());
        body.put("citations", grounded.citedSources() == null ? List.of() : grounded.citedSources());
        body.put("etymology_root", etymologyRoot);
        body.put("user_background", userBackground);

        try {
            JsonNode response = RestClient.create(intelligenceServiceUrl)
                .post()
                .uri("/explanations/adaptive")
                .header("Content-Type", "application/json")
                .body(body)
                .retrieve()
                .body(JsonNode.class);

            if (response == null) {
                return fallback(grounded);
            }

            return AdaptiveExplanationResponseDto.builder()
                .adaptedText(response.path("adapted_text").asText(grounded.explanationText()))
                .ahaFact(response.hasNonNull("aha_fact") ? response.get("aha_fact").asText() : null)
                .citations(grounded.citedSources())
                .userBackgroundApplied(response.path("user_background_applied").asText("fallback"))
                .build();

        } catch (Exception e) {
            log.warn("Adaptive explainer unavailable for {} ({}): {}", structureId, userBackground, e.getMessage());
            return fallback(grounded);
        }
    }

    private Optional<AnatomyPart> resolveStructure(String id) {
        try {
            return anatomyPartRepository.findById(java.util.UUID.fromString(id));
        } catch (IllegalArgumentException notUuid) {
            return anatomyPartRepository.findByCanonicalId(id);
        }
    }

    private AdaptiveExplanationResponseDto fallback(GroundedExplanationDto grounded) {
        return AdaptiveExplanationResponseDto.builder()
            .adaptedText(grounded.explanationText())
            .ahaFact(null)
            .citations(grounded.citedSources())
            .userBackgroundApplied("fallback")
            .build();
    }

    private String formatEtymology(EtymologyRoot root) {
        return String.format("%s (%s) — %s", root.getRoot(), root.getOriginLanguage(), root.getMeaning());
    }

    @SuppressWarnings("unused")
    private static Object unused(CitedSourceDto ignored) {
        return null;
    }
}
