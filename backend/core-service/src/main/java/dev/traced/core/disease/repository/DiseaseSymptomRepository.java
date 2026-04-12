package dev.traced.core.disease.repository;

import dev.traced.core.disease.entity.DiseaseSymptom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface DiseaseSymptomRepository extends JpaRepository<DiseaseSymptom, UUID> {

    @Query("SELECT s FROM DiseaseSymptom s WHERE s.disease.canonicalId = :canonicalId ORDER BY s.displayOrder ASC")
    List<DiseaseSymptom> findByDiseaseCanonicalIdOrdered(String canonicalId);
}
