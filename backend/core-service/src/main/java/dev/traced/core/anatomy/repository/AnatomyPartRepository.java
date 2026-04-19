package dev.traced.core.anatomy.repository;

import dev.traced.core.anatomy.entity.AnatomyPart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AnatomyPartRepository extends JpaRepository<AnatomyPart, UUID> {
    @Query("SELECT ap FROM AnatomyPart ap JOIN FETCH ap.system WHERE ap.canonicalId = :canonicalId")
    Optional<AnatomyPart> findByCanonicalId(String canonicalId);

    boolean existsByCanonicalId(String canonicalId);

    @Query("SELECT ap FROM AnatomyPart ap JOIN FETCH ap.system WHERE ap.system.canonicalId = :systemCanonicalId AND ap.status = 'ACTIVE'")
    List<AnatomyPart> findBySystemCanonicalId(String systemCanonicalId);

    @Query("SELECT ap FROM AnatomyPart ap JOIN FETCH ap.system WHERE ap.system.id = :systemId AND ap.status = 'ACTIVE' ORDER BY ap.displayName ASC")
    List<AnatomyPart> findBySystemIdOrderByDisplayName(UUID systemId);

    @Query("SELECT ap FROM AnatomyPart ap WHERE ap.id IN :ids")
    List<AnatomyPart> findByIdIn(java.util.Collection<UUID> ids);
}
