package dev.traced.core.speciality.repository;

import dev.traced.core.speciality.entity.Speciality;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpecialityRepository extends JpaRepository<Speciality, UUID> {
    Optional<Speciality> findByCanonicalId(String canonicalId);
    List<Speciality> findByStatus(String status);
}
