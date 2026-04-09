package dev.traced.core.evidence.controller;

import dev.traced.core.evidence.entity.CandidateClaim;
import dev.traced.core.evidence.entity.SourceDocument;
import dev.traced.core.evidence.repository.CandidateClaimRepository;
import dev.traced.core.evidence.repository.SourceDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminEvidenceController {

    private final SourceDocumentRepository sourceDocumentRepository;
    private final CandidateClaimRepository candidateClaimRepository;

    @PostMapping("/sources")
    public ResponseEntity<Map<String, Object>> registerSource(@RequestBody Map<String, Object> body) {
        String url = (String) body.get("url");
        if (sourceDocumentRepository.existsByUrl(url)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Source already exists"));
        }

        SourceDocument doc = SourceDocument.builder()
            .url(url)
            .title((String) body.get("title"))
            .sourceType((String) body.get("source_type"))
            .trustScore(new BigDecimal(body.get("trust_score").toString()))
            .jurisdiction((String) body.get("jurisdiction"))
            .rawText((String) body.get("raw_text"))
            .build();

        doc = sourceDocumentRepository.save(doc);
        return ResponseEntity.ok(Map.of("id", doc.getId().toString()));
    }

    @PostMapping("/evidence/claims")
    public ResponseEntity<Map<String, Object>> submitClaims(@RequestBody List<Map<String, Object>> claims) {
        int count = 0;
        for (Map<String, Object> c : claims) {
            CandidateClaim claim = CandidateClaim.builder()
                .subjectCanonicalId((String) c.get("subject_canonical_id"))
                .relationType((String) c.get("relation_type"))
                .objectCanonicalId((String) c.get("object_canonical_id"))
                .claimText((String) c.get("claim_text"))
                .confidence(((Number) c.get("confidence")).doubleValue())
                .status("CANDIDATE") // Always CANDIDATE — regardless of what FastAPI sends
                .extractionModel((String) c.get("extraction_model"))
                .build();
            candidateClaimRepository.save(claim);
            count++;
        }
        return ResponseEntity.ok(Map.of("stored", count));
    }

    @PostMapping("/evidence/claims/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveClaim(@PathVariable String id) {
        var claim = candidateClaimRepository.findById(java.util.UUID.fromString(id))
            .orElseThrow(() -> new dev.traced.core.common.EntityNotFoundException("CandidateClaim", id));
        claim.setStatus("APPROVED");
        claim.setReviewedAt(LocalDateTime.now());
        candidateClaimRepository.save(claim);
        return ResponseEntity.ok(Map.of("id", id, "status", "APPROVED"));
    }

    @PostMapping("/evidence/claims/{id}/reject")
    public ResponseEntity<Map<String, Object>> rejectClaim(@PathVariable String id) {
        var claim = candidateClaimRepository.findById(java.util.UUID.fromString(id))
            .orElseThrow(() -> new dev.traced.core.common.EntityNotFoundException("CandidateClaim", id));
        claim.setStatus("REJECTED");
        claim.setReviewedAt(LocalDateTime.now());
        candidateClaimRepository.save(claim);
        return ResponseEntity.ok(Map.of("id", id, "status", "REJECTED"));
    }

    @GetMapping("/evidence/claims")
    public ResponseEntity<List<CandidateClaim>> listClaims(@RequestParam(required = false) String status) {
        if (status != null) {
            return ResponseEntity.ok(candidateClaimRepository.findByStatus(status));
        }
        return ResponseEntity.ok(candidateClaimRepository.findAll());
    }
}
