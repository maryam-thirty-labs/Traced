package dev.traced.core.anatomy.repository;

import dev.traced.core.anatomy.entity.AnatomySynonym;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AnatomySynonymRepository extends JpaRepository<AnatomySynonym, UUID> {
    List<AnatomySynonym> findByAnatomyPartId(UUID anatomyPartId);
}
