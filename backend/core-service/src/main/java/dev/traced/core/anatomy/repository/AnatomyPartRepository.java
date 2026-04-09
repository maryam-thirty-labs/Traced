package dev.traced.core.anatomy.repository;

import dev.traced.core.anatomy.entity.AnatomyPart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AnatomyPartRepository extends JpaRepository<AnatomyPart, UUID> {
    Optional<AnatomyPart> findByCanonicalId(String canonicalId);
    boolean existsByCanonicalId(String canonicalId);
}
