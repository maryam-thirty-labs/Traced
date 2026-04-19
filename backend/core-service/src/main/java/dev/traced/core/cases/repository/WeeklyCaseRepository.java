package dev.traced.core.cases.repository;

import dev.traced.core.cases.entity.WeeklyCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WeeklyCaseRepository extends JpaRepository<WeeklyCase, UUID> {
    Optional<WeeklyCase> findByWeekStart(LocalDate weekStart);
}
