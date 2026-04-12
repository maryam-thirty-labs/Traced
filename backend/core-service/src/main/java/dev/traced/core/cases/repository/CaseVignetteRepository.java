package dev.traced.core.cases.repository;

import dev.traced.core.cases.entity.CaseVignette;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CaseVignetteRepository extends JpaRepository<CaseVignette, UUID> {
    Optional<CaseVignette> findByLinkedCaseId(UUID linkedCaseId);
}
