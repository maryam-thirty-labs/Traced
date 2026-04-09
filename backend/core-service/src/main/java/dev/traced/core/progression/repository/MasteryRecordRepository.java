package dev.traced.core.progression.repository;

import dev.traced.core.progression.entity.MasteryRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MasteryRecordRepository extends JpaRepository<MasteryRecord, UUID> {
    Optional<MasteryRecord> findByUserProfileIdAndSystemCanonicalId(UUID userProfileId, String systemCanonicalId);
    List<MasteryRecord> findByUserProfileId(UUID userProfileId);
}
