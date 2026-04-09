package dev.traced.core.anatomy.repository;

import dev.traced.core.anatomy.entity.BodySystem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface BodySystemRepository extends JpaRepository<BodySystem, UUID> {
    Optional<BodySystem> findByCanonicalId(String canonicalId);
    boolean existsByCanonicalId(String canonicalId);
}
