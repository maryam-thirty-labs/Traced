package dev.traced.core.lesson.repository;

import dev.traced.core.lesson.entity.DailyLessonRetrievalItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DailyLessonRetrievalItemRepository extends JpaRepository<DailyLessonRetrievalItem, UUID> {
    List<DailyLessonRetrievalItem> findByLessonIdOrderByDisplayOrderAsc(UUID lessonId);
}
