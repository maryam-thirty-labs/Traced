package dev.traced.core.relation.repository;

import dev.traced.core.relation.entity.DiseaseMechanismRelation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface DiseaseMechanismRelationRepository extends JpaRepository<DiseaseMechanismRelation, UUID> {
    @Query("SELECT r FROM DiseaseMechanismRelation r JOIN FETCH r.mechanism WHERE r.disease.id = :diseaseId")
    List<DiseaseMechanismRelation> findByDiseaseId(UUID diseaseId);

    List<DiseaseMechanismRelation> findByMechanismId(UUID mechanismId);
}
