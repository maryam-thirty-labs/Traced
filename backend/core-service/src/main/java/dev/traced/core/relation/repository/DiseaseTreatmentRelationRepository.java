package dev.traced.core.relation.repository;

import dev.traced.core.relation.entity.DiseaseTreatmentRelation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface DiseaseTreatmentRelationRepository extends JpaRepository<DiseaseTreatmentRelation, UUID> {
    @Query("SELECT r FROM DiseaseTreatmentRelation r JOIN FETCH r.treatment WHERE r.disease.id = :diseaseId")
    List<DiseaseTreatmentRelation> findByDiseaseId(UUID diseaseId);

    List<DiseaseTreatmentRelation> findByTreatmentId(UUID treatmentId);
}
