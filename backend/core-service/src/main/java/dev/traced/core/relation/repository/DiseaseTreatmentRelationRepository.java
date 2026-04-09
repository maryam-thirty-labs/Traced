package dev.traced.core.relation.repository;

import dev.traced.core.relation.entity.DiseaseTreatmentRelation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DiseaseTreatmentRelationRepository extends JpaRepository<DiseaseTreatmentRelation, UUID> {
    List<DiseaseTreatmentRelation> findByDiseaseId(UUID diseaseId);
    List<DiseaseTreatmentRelation> findByTreatmentId(UUID treatmentId);
}
