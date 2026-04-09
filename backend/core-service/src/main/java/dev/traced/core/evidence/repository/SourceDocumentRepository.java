package dev.traced.core.evidence.repository;

import dev.traced.core.evidence.entity.SourceDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SourceDocumentRepository extends JpaRepository<SourceDocument, UUID> {
    Optional<SourceDocument> findByUrl(String url);
    boolean existsByUrl(String url);
}
