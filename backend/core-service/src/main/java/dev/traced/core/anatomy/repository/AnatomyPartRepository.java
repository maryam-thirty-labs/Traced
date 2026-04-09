package dev.traced.core.anatomy.repository;

import dev.traced.core.anatomy.entity.AnatomyPart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface AnatomyPartRepository extends JpaRepository<AnatomyPart, UUID> {
    @Query("SELECT ap FROM AnatomyPart ap JOIN FETCH ap.system WHERE ap.canonicalId = :canonicalId")
    Optional<AnatomyPart> findByCanonicalId(String canonicalId);

    boolean existsByCanonicalId(String canonicalId);
}
