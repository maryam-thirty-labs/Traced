package dev.traced.core.relation.repository;

import dev.traced.core.relation.entity.AnatomyDiseaseRelation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface AnatomyDiseaseRelationRepository extends JpaRepository<AnatomyDiseaseRelation, UUID> {
    @Query("SELECT r FROM AnatomyDiseaseRelation r JOIN FETCH r.disease WHERE r.anatomyPart.id = :anatomyPartId")
    List<AnatomyDiseaseRelation> findByAnatomyPartId(UUID anatomyPartId);

    List<AnatomyDiseaseRelation> findByDiseaseId(UUID diseaseId);
}
