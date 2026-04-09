package dev.traced.core.evidence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "evidence_chunks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvidenceChunk {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "chunk_id", nullable = false, unique = true)
    private String chunkId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_document_id", nullable = false)
    private SourceDocument sourceDocument;

    @Column(name = "chunk_text", nullable = false, columnDefinition = "TEXT")
    private String chunkText;

    @Column(name = "section_title")
    private String sectionTitle;

    @Column(name = "chunk_order", nullable = false)
    private Integer chunkOrder;

    // pgvector embedding stored as raw column — accessed via native queries
    // JPA does not natively support vector types
}
