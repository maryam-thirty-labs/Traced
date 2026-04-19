package dev.traced.core.lesson.repository;

import dev.traced.core.lesson.entity.DailyLessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DailyLessonProgressRepository extends JpaRepository<DailyLessonProgress, UUID> {
    Optional<DailyLessonProgress> findByUserIdAndLessonDate(UUID userId, LocalDate lessonDate);
}
