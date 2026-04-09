package dev.traced.core.evidence.repository;

import dev.traced.core.evidence.entity.EvidenceChunk;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EvidenceChunkRepository extends JpaRepository<EvidenceChunk, UUID> {
    Optional<EvidenceChunk> findByChunkId(String chunkId);
    boolean existsByChunkId(String chunkId);
    List<EvidenceChunk> findBySourceDocumentId(UUID sourceDocumentId);
}
