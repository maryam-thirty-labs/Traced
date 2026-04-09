package dev.traced.core.cases.repository;

import dev.traced.core.cases.entity.Case;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CaseRepository extends JpaRepository<Case, UUID> {
    Optional<Case> findByCaseId(String caseId);
    boolean existsByCaseId(String caseId);
    List<Case> findByLinkedAnatomyId(UUID linkedAnatomyId);
}
