package dev.traced.core.relation.repository;

import dev.traced.core.relation.entity.AnatomyDiseaseRelation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AnatomyDiseaseRelationRepository extends JpaRepository<AnatomyDiseaseRelation, UUID> {
    List<AnatomyDiseaseRelation> findByAnatomyPartId(UUID anatomyPartId);
    List<AnatomyDiseaseRelation> findByDiseaseId(UUID diseaseId);
}
