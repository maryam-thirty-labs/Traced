package dev.traced.core.leaderboard.repository;

import dev.traced.core.leaderboard.entity.WeeklyXpSnapshot;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WeeklyXpSnapshotRepository extends JpaRepository<WeeklyXpSnapshot, UUID> {

    Optional<WeeklyXpSnapshot> findByUserProfileIdAndWeekStartDate(UUID userProfileId, LocalDate weekStartDate);

    @Query("SELECT s FROM WeeklyXpSnapshot s JOIN FETCH s.userProfile WHERE s.weekStartDate = :weekStartDate AND s.archived = false ORDER BY s.xpEarnedThisWeek DESC, s.userProfile.joinedAt ASC")
    Page<WeeklyXpSnapshot> findByWeekStartDate(LocalDate weekStartDate, Pageable pageable);

    @Query("SELECT s FROM WeeklyXpSnapshot s WHERE s.weekStartDate = :weekStartDate AND s.archived = false ORDER BY s.xpEarnedThisWeek DESC, s.userProfile.joinedAt ASC")
    List<WeeklyXpSnapshot> findAllByWeekStartDate(LocalDate weekStartDate);

    List<WeeklyXpSnapshot> findByWeekStartDateAndArchivedFalse(LocalDate weekStartDate);
}
