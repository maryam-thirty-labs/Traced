package dev.traced.core.evidence.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.traced.core.evidence.dto.GroundedExplanationDto;
import dev.traced.core.evidence.entity.CandidateClaim;
import dev.traced.core.evidence.entity.EvidenceChunk;
import dev.traced.core.evidence.repository.CandidateClaimRepository;
import dev.traced.core.evidence.repository.EvidenceChunkRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExplanationService {

    private static final String CACHE_PREFIX = "exp:cache:";
    private static final Duration CACHE_TTL = Duration.ofMinutes(10);

    private final CandidateClaimRepository candidateClaimRepository;
    private final EvidenceChunkRepository evidenceChunkRepository;
    private final ObjectMapper objectMapper;
    private final StringRedisTemplate redisTemplate;

    @Value("${traced.intelligence-service.url:http://localhost:8000}")
    private String intelligenceServiceUrl;

    public GroundedExplanationDto generateExplanation(String canonicalId) {
        // Check Redis cache first
        String cacheKey = CACHE_PREFIX + canonicalId;
        String cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            try {
                return objectMapper.readValue(cached, GroundedExplanationDto.class);
            } catch (Exception e) {
                log.warn("Failed to deserialize cached explanation for {}", canonicalId, e);
            }
        }

        // Only fetch APPROVED claims — never CANDIDATE
        List<CandidateClaim> approvedClaims = candidateClaimRepository
            .findBySubjectCanonicalIdAndStatus(canonicalId, "APPROVED");

        // Collect supporting chunk IDs from approved claims
        Set<String> chunkIds = new HashSet<>();
        for (CandidateClaim claim : approvedClaims) {
            if (claim.getSourceChunkIds() != null) {
                try {
                    List<String> ids = objectMapper.readValue(
                        claim.getSourceChunkIds(),
                        objectMapper.getTypeFactory().constructCollectionType(List.class, String.class)
                    );
                    chunkIds.addAll(ids);
                } catch (Exception e) {
                    log.warn("Failed to parse sourceChunkIds for claim {}", claim.getId(), e);
                }
            }
        }

        // Fetch chunks
        List<EvidenceChunk> chunks = chunkIds.stream()
            .map(evidenceChunkRepository::findByChunkId)
            .filter(Optional::isPresent)
            .map(Optional::get)
            .toList();

        // Build request to FastAPI
        List<Map<String, Object>> claimMaps = approvedClaims.stream()
            .map(c -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", c.getId().toString());
                m.put("claimText", c.getClaimText());
                m.put("relationType", c.getRelationType());
                m.put("confidence", c.getConfidence());
                return m;
            }).toList();

        List<Map<String, Object>> chunkMaps = chunks.stream()
            .map(c -> {
                Map<String, Object> m = new HashMap<>();
                m.put("chunkId", c.getChunkId());
                m.put("chunkText", c.getChunkText());
                m.put("sourceDocumentId", c.getSourceDocument().getId().toString());
                return m;
            }).toList();

        Map<String, Object> requestBody = Map.of(
            "entity_id", canonicalId,
            "approved_claims", claimMaps,
            "chunks", chunkMaps
        );

        // Call FastAPI grounding service
        RestClient restClient = RestClient.create(intelligenceServiceUrl);

        GroundedExplanationDto result;
        try {
            JsonNode response = restClient.post()
                .uri("/intelligence/grounding/explain")
                .header("Content-Type", "application/json")
                .body(requestBody)
                .retrieve()
                .body(JsonNode.class);

            if (response == null) {
                return uncertainResponse();
            }

            List<String> citedClaimIds = new ArrayList<>();
            if (response.has("cited_claim_ids")) {
                response.get("cited_claim_ids").forEach(n -> citedClaimIds.add(n.asText()));
            }

            List<String> citedChunkIds = new ArrayList<>();
            if (response.has("cited_chunk_ids")) {
                response.get("cited_chunk_ids").forEach(n -> citedChunkIds.add(n.asText()));
            }

            String contradictionNotice = response.has("contradiction_notice") && !response.get("contradiction_notice").isNull()
                ? response.get("contradiction_notice").asText()
                : null;

            result = GroundedExplanationDto.builder()
                .explanationText(response.path("explanation_text").asText(""))
                .citedClaimIds(citedClaimIds)
                .citedChunkIds(citedChunkIds)
                .confidenceLabel(response.path("confidence_label").asText("UNCERTAIN"))
                .contradictionNotice(contradictionNotice)
                .build();

        } catch (Exception e) {
            log.error("Failed to call intelligence service for {}", canonicalId, e);
            return uncertainResponse();
        }

        // Write to Redis cache with 10-min TTL
        try {
            String json = objectMapper.writeValueAsString(result);
            redisTemplate.opsForValue().set(cacheKey, json, CACHE_TTL);
        } catch (Exception e) {
            log.warn("Failed to cache explanation for {}", canonicalId, e);
        }

        return result;
    }

    private GroundedExplanationDto uncertainResponse() {
        return GroundedExplanationDto.builder()
            .explanationText("Insufficient evidence to generate a grounded explanation.")
            .citedClaimIds(List.of())
            .citedChunkIds(List.of())
            .confidenceLabel("UNCERTAIN")
            .build();
    }
}
