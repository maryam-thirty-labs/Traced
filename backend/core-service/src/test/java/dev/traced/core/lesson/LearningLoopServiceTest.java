package dev.traced.core.lesson;

import dev.traced.core.anatomy.repository.AnatomyPartRepository;
import dev.traced.core.anatomy.repository.BodySystemRepository;
import dev.traced.core.lesson.dto.LessonCompletionDto;
import dev.traced.core.lesson.entity.AnatomyStructureProgress;
import dev.traced.core.lesson.entity.DailyLessonProgress;
import dev.traced.core.lesson.entity.DailyLessonRetrievalItem;
import dev.traced.core.lesson.repository.AnatomyStructureProgressRepository;
import dev.traced.core.lesson.repository.DailyLessonProgressRepository;
import dev.traced.core.lesson.repository.DailyLessonRetrievalItemRepository;
import dev.traced.core.lesson.service.LearningLoopService;
import dev.traced.core.lesson.service.LearningLoopService.RetrievalAnswer;
import dev.traced.core.profile.entity.UserProfile;
import dev.traced.core.profile.repository.UserProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LearningLoopServiceTest {

    @Mock private DailyLessonProgressRepository lessonRepository;
    @Mock private DailyLessonRetrievalItemRepository retrievalItemRepository;
    @Mock private AnatomyStructureProgressRepository structureProgressRepository;
    @Mock private UserProfileRepository userProfileRepository;
    @Mock private AnatomyPartRepository anatomyPartRepository;
    @Mock private BodySystemRepository bodySystemRepository;

    @InjectMocks private LearningLoopService service;

    private final UUID userId = UUID.randomUUID();
    private final UUID lessonId = UUID.randomUUID();
    private final UUID retrievalStructureA = UUID.randomUUID();
    private final UUID retrievalStructureB = UUID.randomUUID();
    private final UUID exploreStructure = UUID.randomUUID();
    private UserProfile profile;
    private DailyLessonProgress lesson;

    @BeforeEach
    void setup() {
        profile = UserProfile.builder()
            .userId(userId)
            .displayName("Tester")
            .totalXp(100)
            .currentStreak(0)
            .learningActivated(false)
            .build();
        profile.setId(UUID.randomUUID());

        lesson = DailyLessonProgress.builder()
            .userId(userId)
            .lessonDate(LocalDate.now())
            .structureExplored(exploreStructure)
            .completed(false)
            .xpAwarded(0)
            .build();
        lesson.setId(lessonId);
    }

    @Test
    void completion_awards_base_plus_correct_plus_explore_xp() {
        when(lessonRepository.findByUserIdAndLessonDate(userId, LocalDate.now()))
            .thenReturn(Optional.of(lesson));
        when(userProfileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));
        when(retrievalItemRepository.findByLessonIdOrderByDisplayOrderAsc(lessonId))
            .thenReturn(List.of(
                DailyLessonRetrievalItem.builder()
                    .lessonId(lessonId).structureId(retrievalStructureA).displayOrder(0).build(),
                DailyLessonRetrievalItem.builder()
                    .lessonId(lessonId).structureId(retrievalStructureB).displayOrder(1).build()
            ));
        when(structureProgressRepository.findByUserIdAndStructureId(any(), any()))
            .thenReturn(Optional.empty());

        LessonCompletionDto result = service.completeTodayLesson(userId, List.of(
            new RetrievalAnswer(retrievalStructureA, true),
            new RetrievalAnswer(retrievalStructureB, false)
        ));

        // 20 base + 5 * 1 correct + 10 explore = 35
        assertThat(result.xpAwarded()).isEqualTo(35);
        assertThat(result.newXp()).isEqualTo(135);
    }

    @Test
    void first_completion_activates_learning() {
        when(lessonRepository.findByUserIdAndLessonDate(userId, LocalDate.now()))
            .thenReturn(Optional.of(lesson));
        when(userProfileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));
        when(retrievalItemRepository.findByLessonIdOrderByDisplayOrderAsc(lessonId))
            .thenReturn(List.of());
        when(structureProgressRepository.findByUserIdAndStructureId(any(), any()))
            .thenReturn(Optional.empty());

        LessonCompletionDto result = service.completeTodayLesson(userId, List.of());

        assertThat(result.onboardingCompleted()).isTrue();
        assertThat(profile.getLearningActivated()).isTrue();
    }

    @Test
    void second_completion_same_day_is_idempotent() {
        lesson.setCompleted(true);
        lesson.setXpAwarded(35);
        when(lessonRepository.findByUserIdAndLessonDate(userId, LocalDate.now()))
            .thenReturn(Optional.of(lesson));
        when(userProfileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));

        LessonCompletionDto result = service.completeTodayLesson(userId, List.of(
            new RetrievalAnswer(retrievalStructureA, true)
        ));

        assertThat(result.xpAwarded()).isEqualTo(35);
        // XP should not increase on a second call.
        assertThat(result.newXp()).isEqualTo(100);
        verify(userProfileRepository, never()).save(any());
        verify(lessonRepository, never()).save(any());
    }

    @Test
    void streak_increments_when_yesterday_was_completed() {
        profile.setLastActiveDate(LocalDate.now().minusDays(1));
        profile.setCurrentStreak(5);

        when(lessonRepository.findByUserIdAndLessonDate(userId, LocalDate.now()))
            .thenReturn(Optional.of(lesson));
        when(userProfileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));
        when(retrievalItemRepository.findByLessonIdOrderByDisplayOrderAsc(lessonId))
            .thenReturn(List.of());
        when(structureProgressRepository.findByUserIdAndStructureId(any(), any()))
            .thenReturn(Optional.empty());

        LessonCompletionDto result = service.completeTodayLesson(userId, List.of());

        assertThat(result.streakDays()).isEqualTo(6);
    }

    @Test
    void streak_resets_to_1_when_gap_over_one_day() {
        profile.setLastActiveDate(LocalDate.now().minusDays(3));
        profile.setCurrentStreak(5);

        when(lessonRepository.findByUserIdAndLessonDate(userId, LocalDate.now()))
            .thenReturn(Optional.of(lesson));
        when(userProfileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));
        when(retrievalItemRepository.findByLessonIdOrderByDisplayOrderAsc(lessonId))
            .thenReturn(List.of());
        when(structureProgressRepository.findByUserIdAndStructureId(any(), any()))
            .thenReturn(Optional.empty());

        LessonCompletionDto result = service.completeTodayLesson(userId, List.of());

        assertThat(result.streakDays()).isEqualTo(1);
    }

    @Test
    void mark_structure_explored_sets_explored_at_and_activates() {
        when(structureProgressRepository.findByUserIdAndStructureId(userId, exploreStructure))
            .thenReturn(Optional.empty());
        when(userProfileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));

        service.markStructureExplored(userId, exploreStructure, "EXPLORER");

        assertThat(profile.getLearningActivated()).isTrue();
        verify(structureProgressRepository).save(any(AnatomyStructureProgress.class));
    }
}
