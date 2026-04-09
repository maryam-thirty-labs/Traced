package dev.traced.core.evidence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "candidate_claims")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateClaim {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "subject_canonical_id", nullable = false)
    private String subjectCanonicalId;

    @Column(name = "relation_type", nullable = false)
    private String relationType;

    @Column(name = "object_canonical_id", nullable = false)
    private String objectCanonicalId;

    @Column(name = "claim_text", nullable = false, columnDefinition = "TEXT")
    private String claimText;

    @Column(nullable = false, precision = 5, scale = 3)
    private java.math.BigDecimal confidence;

    @Column(nullable = false)
    @Builder.Default
    private String status = "CANDIDATE";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "source_chunk_ids", columnDefinition = "jsonb")
    private String sourceChunkIds;

    @Column(name = "extraction_model")
    private String extractionModel;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
