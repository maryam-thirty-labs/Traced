package dev.traced.core.evidence.repository;

import dev.traced.core.evidence.entity.CandidateClaim;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CandidateClaimRepository extends JpaRepository<CandidateClaim, UUID> {
    List<CandidateClaim> findByStatus(String status);
    List<CandidateClaim> findBySubjectCanonicalIdAndStatus(String subjectCanonicalId, String status);
}
