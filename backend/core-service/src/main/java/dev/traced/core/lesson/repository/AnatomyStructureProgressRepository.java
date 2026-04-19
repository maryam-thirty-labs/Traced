package dev.traced.core.lesson.repository;

import dev.traced.core.lesson.entity.AnatomyStructureProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AnatomyStructureProgressRepository extends JpaRepository<AnatomyStructureProgress, UUID> {
    List<AnatomyStructureProgress> findByUserId(UUID userId);
    Optional<AnatomyStructureProgress> findByUserIdAndStructureId(UUID userId, UUID structureId);
}
