package dev.traced.core.lesson.service;

import dev.traced.core.lesson.dto.LessonCompletionDto;
import dev.traced.core.lesson.dto.LessonDto;
import dev.traced.core.lesson.dto.NextActionDto;
import dev.traced.core.lesson.entity.AnatomyStructureProgress;
import dev.traced.core.lesson.entity.DailyLessonProgress;
import dev.traced.core.lesson.entity.DailyLessonRetrievalItem;
import dev.traced.core.lesson.repository.AnatomyStructureProgressRepository;
import dev.traced.core.lesson.repository.DailyLessonProgressRepository;
import dev.traced.core.lesson.repository.DailyLessonRetrievalItemRepository;
import dev.traced.core.profile.entity.UserProfile;
import dev.traced.core.profile.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Single write coordinator for all progression state.
 *
 * All writes to anatomy_structure_progress, daily_lesson_progress, and
 * user_profiles.learning_activated go through this service. Never call
 * these repositories directly from controllers or other services.
 *
 * Methods implemented in Sprint 7 are skeletons; full logic is added by
 * Sprints 8 (generation), 9 (completion), 21 (explored write), 22 (next-action).
 */
@Service
@RequiredArgsConstructor
public class LearningLoopService {

    private final DailyLessonProgressRepository lessonRepository;
    private final DailyLessonRetrievalItemRepository retrievalItemRepository;
    private final AnatomyStructureProgressRepository structureProgressRepository;
    private final UserProfileRepository userProfileRepository;

    @Transactional(readOnly = true)
    public Optional<LessonDto> getTodayLesson(UUID userId) {
        Optional<DailyLessonProgress> existing = lessonRepository
            .findByUserIdAndLessonDate(userId, LocalDate.now());
        // Sprint 7 returns whatever is in the DB. Sprint 8 adds generation logic.
        return existing.map(lesson -> LessonDto.builder()
            .lessonId(lesson.getId())
            .lessonDate(lesson.getLessonDate().toString())
            .completed(Boolean.TRUE.equals(lesson.getCompleted()))
            .retrieval(List.of())
            .explore(null)
            .expectedXp(0)
            .build());
    }

    @Transactional
    public LessonCompletionDto completeTodayLesson(UUID userId) {
        // Sprint 9 implements the full completion flow.
        throw new UnsupportedOperationException("Implemented in Sprint 9");
    }

    @Transactional
    public void markStructureExplored(UUID userId, UUID structureId, String source) {
        LocalDateTime now = LocalDateTime.now();
        Optional<AnatomyStructureProgress> existing =
            structureProgressRepository.findByUserIdAndStructureId(userId, structureId);

        AnatomyStructureProgress progress = existing.orElseGet(() -> AnatomyStructureProgress.builder()
            .userId(userId)
            .structureId(structureId)
            .firstSeenAt(now)
            .firstSource(source == null ? "EXPLORER" : source)
            .build());

        if (progress.getExploredAt() == null) {
            progress.setExploredAt(now);
        }
        progress.setLastExploredAt(now);
        structureProgressRepository.save(progress);

        activateIfNotAlready(userId);
    }

    /**
     * Sets learning_activated = true if not already set.
     * Idempotent.
     */
    @Transactional
    public boolean activateIfNotAlready(UUID userId) {
        Optional<UserProfile> profile = userProfileRepository.findByUserId(userId);
        if (profile.isEmpty()) return false;
        UserProfile p = profile.get();
        if (Boolean.TRUE.equals(p.getLearningActivated())) return false;
        p.setLearningActivated(true);
        userProfileRepository.save(p);
        return true;
    }

    @Transactional(readOnly = true)
    public NextActionDto getNextAction(UUID userId) {
        LocalDate today = LocalDate.now();
        Optional<DailyLessonProgress> todayLesson =
            lessonRepository.findByUserIdAndLessonDate(userId, today);
        boolean completed = todayLesson.map(DailyLessonProgress::getCompleted).orElse(false);
        boolean available = todayLesson.isEmpty() || !completed;

        List<AnatomyStructureProgress> progress = structureProgressRepository.findByUserId(userId);
        List<UUID> exploredIds = progress.stream()
            .filter(p -> p.getExploredAt() != null)
            .map(AnatomyStructureProgress::getStructureId)
            .toList();

        UserProfile profile = userProfileRepository.findByUserId(userId).orElse(null);
        Integer streakDays = profile == null ? 0 : profile.getCurrentStreak();
        UUID currentSystemId = profile == null ? null : profile.getCurrentSystemId();
        boolean onboardingCompleted = profile != null && Boolean.TRUE.equals(profile.getLearningActivated());

        return NextActionDto.builder()
            .lessonAvailableToday(available)
            .lessonCompleted(completed)
            .streakDays(streakDays == null ? 0 : streakDays)
            .nextRootPreview(null) // Sprint 22 wires real content.
            .currentSystemId(currentSystemId)
            .exploredStructureIds(exploredIds)
            .onboardingCompleted(onboardingCompleted)
            .build();
    }

    @SuppressWarnings("unused") // Used by the retrieval-persistence hook in Sprint 8.
    DailyLessonRetrievalItem persistRetrievalItem(UUID lessonId, UUID structureId, int displayOrder) {
        return retrievalItemRepository.save(DailyLessonRetrievalItem.builder()
            .lessonId(lessonId)
            .structureId(structureId)
            .displayOrder(displayOrder)
            .build());
    }
}
