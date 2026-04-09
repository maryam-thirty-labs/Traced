package dev.traced.core.cases.repository;

import dev.traced.core.cases.entity.CaseAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CaseAttemptRepository extends JpaRepository<CaseAttempt, UUID> {
    List<CaseAttempt> findByUserProfileId(UUID userProfileId);
    List<CaseAttempt> findByUserProfileIdAndLinkedCaseId(UUID userProfileId, UUID caseId);
}
