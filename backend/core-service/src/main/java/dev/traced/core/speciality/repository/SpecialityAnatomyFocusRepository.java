package dev.traced.core.speciality.repository;

import dev.traced.core.speciality.entity.SpecialityAnatomyFocus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface SpecialityAnatomyFocusRepository extends JpaRepository<SpecialityAnatomyFocus, UUID> {

    @Query("SELECT f FROM SpecialityAnatomyFocus f JOIN FETCH f.anatomyPart WHERE f.speciality.canonicalId = :specialityCanonicalId")
    List<SpecialityAnatomyFocus> findBySpecialityCanonicalId(String specialityCanonicalId);

    @Query("SELECT f FROM SpecialityAnatomyFocus f JOIN FETCH f.speciality WHERE f.anatomyPart.canonicalId = :anatomyCanonicalId")
    List<SpecialityAnatomyFocus> findByAnatomyCanonicalId(String anatomyCanonicalId);
}
