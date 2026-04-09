package dev.traced.core.evidence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "source_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SourceDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String url;

    @Column(nullable = false)
    private String title;

    @Column(name = "source_type", nullable = false)
    private String sourceType;

    @Column(name = "trust_score", nullable = false, precision = 4, scale = 2)
    private BigDecimal trustScore;

    private String jurisdiction;

    @Column(name = "raw_text", columnDefinition = "TEXT")
    private String rawText;

    @Column(name = "ingested_at", nullable = false)
    @Builder.Default
    private LocalDateTime ingestedAt = LocalDateTime.now();

    @Column(nullable = false)
    @Builder.Default
    private String status = "ACTIVE";
}
