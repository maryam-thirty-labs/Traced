package dev.traced.core.treatment.repository;

import dev.traced.core.treatment.entity.Treatment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TreatmentRepository extends JpaRepository<Treatment, UUID> {
    Optional<Treatment> findByCanonicalId(String canonicalId);
    boolean existsByCanonicalId(String canonicalId);
}
