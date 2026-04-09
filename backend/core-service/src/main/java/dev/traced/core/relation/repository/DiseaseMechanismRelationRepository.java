package dev.traced.core.relation.repository;

import dev.traced.core.relation.entity.DiseaseMechanismRelation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DiseaseMechanismRelationRepository extends JpaRepository<DiseaseMechanismRelation, UUID> {
    List<DiseaseMechanismRelation> findByDiseaseId(UUID diseaseId);
    List<DiseaseMechanismRelation> findByMechanismId(UUID mechanismId);
}
