package dev.traced.core.cases.repository;

import dev.traced.core.cases.entity.Case;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CaseRepository extends JpaRepository<Case, UUID> {
    Optional<Case> findByCaseId(String caseId);
    boolean existsByCaseId(String caseId);
    List<Case> findByLinkedAnatomyId(UUID linkedAnatomyId);

    @Query("SELECT c FROM Case c WHERE c.linkedDisease.canonicalId = :canonicalId AND c.status = 'ACTIVE'")
    List<Case> findByLinkedDiseaseCanonicalId(String canonicalId);
}
