package dev.traced.core.disease.repository;

import dev.traced.core.disease.entity.DiseaseAlias;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DiseaseAliasRepository extends JpaRepository<DiseaseAlias, UUID> {
    List<DiseaseAlias> findByDiseaseId(UUID diseaseId);
}
