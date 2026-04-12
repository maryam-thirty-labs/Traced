package dev.traced.core.disease.repository;

import dev.traced.core.disease.entity.DiseaseInvestigation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface DiseaseInvestigationRepository extends JpaRepository<DiseaseInvestigation, UUID> {

    @Query("SELECT i FROM DiseaseInvestigation i WHERE i.disease.canonicalId = :canonicalId ORDER BY i.displayOrder ASC")
    List<DiseaseInvestigation> findByDiseaseCanonicalIdOrdered(String canonicalId);
}
