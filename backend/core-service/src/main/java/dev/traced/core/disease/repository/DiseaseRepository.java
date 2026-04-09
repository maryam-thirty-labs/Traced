package dev.traced.core.disease.repository;

import dev.traced.core.disease.entity.Disease;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface DiseaseRepository extends JpaRepository<Disease, UUID> {
    Optional<Disease> findByCanonicalId(String canonicalId);
    boolean existsByCanonicalId(String canonicalId);
}
