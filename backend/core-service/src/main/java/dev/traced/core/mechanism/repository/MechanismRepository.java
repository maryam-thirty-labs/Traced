package dev.traced.core.mechanism.repository;

import dev.traced.core.mechanism.entity.Mechanism;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface MechanismRepository extends JpaRepository<Mechanism, UUID> {
    Optional<Mechanism> findByCanonicalId(String canonicalId);
    boolean existsByCanonicalId(String canonicalId);
}
