package dev.traced.core.lesson.service;

import dev.traced.core.anatomy.entity.AnatomyPart;
import dev.traced.core.anatomy.entity.BodySystem;
import dev.traced.core.anatomy.repository.AnatomyPartRepository;
import dev.traced.core.anatomy.repository.BodySystemRepository;
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
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Single write coordinator for all progression state.
 *
 * All writes to anatomy_structure_progress, daily_lesson_progress, and
 * user_profiles.learning_activated go through this service.
 */
@Service
@RequiredArgsConstructor
public class LearningLoopService {

    private static final int TARGET_RETRIEVAL_COUNT = 3;
    private static final int BASE_LESSON_XP = 20;
    private static final int XP_PER_CORRECT_RETRIEVAL = 5;
    private static final int EXPLORE_XP = 10;

    private final DailyLessonProgressRepository lessonRepository;
    private final DailyLessonRetrievalItemRepository retrievalItemRepository;
    private final AnatomyStructureProgressRepository structureProgressRepository;
    private final UserProfileRepository userProfileRepository;
    private final AnatomyPartRepository anatomyPartRepository;
    private final BodySystemRepository bodySystemRepository;

    @Transactional
    public LessonDto getTodayLesson(UUID userId) {
        LocalDate today = LocalDate.now();
        Optional<DailyLessonProgress> existing =
            lessonRepository.findByUserIdAndLessonDate(userId, today);
        if (existing.isPresent()) {
            return buildDtoFromExisting(existing.get());
        }
        return generateAndPersist(userId, today);
    }

    private LessonDto buildDtoFromExisting(DailyLessonProgress lesson) {
        List<DailyLessonRetrievalItem> items =
            retrievalItemRepository.findByLessonIdOrderByDisplayOrderAsc(lesson.getId());
        List<AnatomyPart> retrievalParts = items.isEmpty()
            ? List.of()
            : anatomyPartRepository.findByIdIn(items.stream()
                .map(DailyLessonRetrievalItem::getStructureId)
                .toList());
        Map<UUID, AnatomyPart> retrievalPartsById = retrievalParts.stream()
            .collect(Collectors.toMap(AnatomyPart::getId, p -> p));
        List<AnatomyPart> systemSiblings = retrievalParts.isEmpty()
            ? List.of()
            : anatomyPartRepository.findBySystemIdOrderByDisplayName(
                retrievalParts.get(0).getSystem().getId());

        List<LessonDto.RetrievalItemDto> retrievalDtos = new ArrayList<>();
        for (DailyLessonRetrievalItem item : items) {
            AnatomyPart part = retrievalPartsById.get(item.getStructureId());
            if (part == null) continue;
            retrievalDtos.add(buildRetrievalDto(part, item.getDisplayOrder(), systemSiblings));
        }

        LessonDto.ExploreItemDto exploreDto = null;
        if (lesson.getStructureExplored() != null) {
            exploreDto = anatomyPartRepository.findById(lesson.getStructureExplored())
                .map(p -> LessonDto.ExploreItemDto.builder()
                    .structureId(p.getId())
                    .canonicalId(p.getCanonicalId())
                    .displayName(p.getDisplayName())
                    .system(p.getSystem().getName())
                    .etymologyRootId(lesson.getEtymologyRootId())
                    .etymologyPreviewRoot(null)
                    .build())
                .orElse(null);
        }

        return LessonDto.builder()
            .lessonId(lesson.getId())
            .lessonDate(lesson.getLessonDate().toString())
            .completed(Boolean.TRUE.equals(lesson.getCompleted()))
            .retrieval(retrievalDtos)
            .explore(exploreDto)
            .expectedXp(expectedXp(retrievalDtos.size(), exploreDto != null))
            .build();
    }

    private LessonDto generateAndPersist(UUID userId, LocalDate today) {
        // Pick the user's current system path position (seeded if absent).
        UserProfile profile = userProfileRepository.findByUserId(userId).orElse(null);
        BodySystem currentSystem = resolveOrInitCurrentSystem(profile);

        List<AnatomyStructureProgress> progress = structureProgressRepository.findByUserId(userId);
        Set<UUID> seenIds = progress.stream()
            .map(AnatomyStructureProgress::getStructureId)
            .collect(Collectors.toSet());

        // Retrieval: seen structures prioritised by oldest last_reviewed_at.
        List<AnatomyStructureProgress> seenSorted = new ArrayList<>(progress);
        seenSorted.sort(Comparator.comparing(
            (AnatomyStructureProgress p) -> p.getLastReviewedAt() == null
                ? LocalDateTime.MIN
                : p.getLastReviewedAt()));
        List<AnatomyStructureProgress> retrievalCandidates = seenSorted.stream()
            .limit(TARGET_RETRIEVAL_COUNT)
            .toList();
        List<AnatomyPart> retrievalParts = retrievalCandidates.isEmpty()
            ? List.of()
            : anatomyPartRepository.findByIdIn(retrievalCandidates.stream()
                .map(AnatomyStructureProgress::getStructureId)
                .toList());

        // Pad with intro structures from the current system if not enough history.
        List<AnatomyPart> systemStructures = currentSystem == null
            ? List.of()
            : anatomyPartRepository.findBySystemIdOrderByDisplayName(currentSystem.getId());
        if (retrievalParts.size() < TARGET_RETRIEVAL_COUNT) {
            List<AnatomyPart> padded = new ArrayList<>(retrievalParts);
            for (AnatomyPart p : systemStructures) {
                if (padded.size() >= TARGET_RETRIEVAL_COUNT) break;
                if (padded.stream().anyMatch(r -> r.getId().equals(p.getId()))) continue;
                padded.add(p);
            }
            retrievalParts = padded;
        }

        // Explore: first unseen structure in current system path, advancing if exhausted.
        AnatomyPart explore = pickExploreStructure(currentSystem, systemStructures, seenIds);
        BodySystem exploreSystem = explore == null ? currentSystem : explore.getSystem();

        // Persist header.
        DailyLessonProgress header = lessonRepository.save(DailyLessonProgress.builder()
            .userId(userId)
            .lessonDate(today)
            .structureExplored(explore == null ? null : explore.getId())
            .etymologyRootId(null) // Sprint 15 adds etymology_roots FK.
            .completed(false)
            .xpAwarded(0)
            .build());

        // Persist retrieval items.
        int order = 0;
        for (AnatomyPart p : retrievalParts) {
            retrievalItemRepository.save(DailyLessonRetrievalItem.builder()
                .lessonId(header.getId())
                .structureId(p.getId())
                .displayOrder(order++)
                .build());
        }

        // Update user profile's current system if advanced.
        if (profile != null && explore != null
            && (profile.getCurrentSystemId() == null
                || !profile.getCurrentSystemId().equals(exploreSystem.getId()))) {
            profile.setCurrentSystemId(exploreSystem.getId());
            userProfileRepository.save(profile);
        }

        // Build DTO.
        List<LessonDto.RetrievalItemDto> retrievalDtos = new ArrayList<>();
        int idx = 0;
        for (AnatomyPart p : retrievalParts) {
            retrievalDtos.add(buildRetrievalDto(p, idx++, systemStructures));
        }
        LessonDto.ExploreItemDto exploreDto = explore == null ? null
            : LessonDto.ExploreItemDto.builder()
                .structureId(explore.getId())
                .canonicalId(explore.getCanonicalId())
                .displayName(explore.getDisplayName())
                .system(explore.getSystem().getName())
                .etymologyRootId(null)
                .etymologyPreviewRoot(null)
                .build();

        return LessonDto.builder()
            .lessonId(header.getId())
            .lessonDate(today.toString())
            .completed(false)
            .retrieval(retrievalDtos)
            .explore(exploreDto)
            .expectedXp(expectedXp(retrievalDtos.size(), exploreDto != null))
            .build();
    }

    private BodySystem resolveOrInitCurrentSystem(UserProfile profile) {
        if (profile != null && profile.getCurrentSystemId() != null) {
            Optional<BodySystem> found = bodySystemRepository.findById(profile.getCurrentSystemId());
            if (found.isPresent()) return found.get();
        }
        List<BodySystem> systems = bodySystemRepository.findAllByStatusOrderByDisplayOrderAsc("ACTIVE");
        if (systems.isEmpty()) return null;
        BodySystem first = systems.get(0);
        if (profile != null) {
            profile.setCurrentSystemId(first.getId());
            userProfileRepository.save(profile);
        }
        return first;
    }

    private AnatomyPart pickExploreStructure(BodySystem start, List<AnatomyPart> structures, Set<UUID> seen) {
        for (AnatomyPart p : structures) {
            if (!seen.contains(p.getId())) return p;
        }
        // Current system exhausted: walk the remaining ordered systems.
        if (start == null) return null;
        List<BodySystem> systems = bodySystemRepository.findAllByStatusOrderByDisplayOrderAsc("ACTIVE");
        boolean passedStart = false;
        for (BodySystem sys : systems) {
            if (!passedStart) {
                if (sys.getId().equals(start.getId())) passedStart = true;
                continue;
            }
            List<AnatomyPart> next = anatomyPartRepository.findBySystemIdOrderByDisplayName(sys.getId());
            for (AnatomyPart p : next) {
                if (!seen.contains(p.getId())) return p;
            }
        }
        return null;
    }

    private LessonDto.RetrievalItemDto buildRetrievalDto(AnatomyPart part, int order, List<AnatomyPart> siblings) {
        String correct = descriptionFor(part);
        List<String> distractorPool = siblings.stream()
            .filter(s -> !s.getId().equals(part.getId()))
            .map(LearningLoopService::descriptionFor)
            .filter(d -> d != null && !d.isBlank())
            .distinct()
            .collect(Collectors.toList());
        Collections.shuffle(distractorPool, new Random(part.getId().getMostSignificantBits()));
        List<String> distractors = distractorPool.stream().limit(3).toList();

        List<LessonDto.AnswerOptionDto> options = new ArrayList<>();
        options.add(LessonDto.AnswerOptionDto.builder().text(correct).correct(true).build());
        for (String d : distractors) {
            options.add(LessonDto.AnswerOptionDto.builder().text(d).correct(false).build());
        }
        Collections.shuffle(options, new Random(part.getId().getLeastSignificantBits()));

        return LessonDto.RetrievalItemDto.builder()
            .structureId(part.getId())
            .canonicalId(part.getCanonicalId())
            .displayName(part.getDisplayName())
            .options(options)
            .displayOrder(order)
            .build();
    }

    private static String descriptionFor(AnatomyPart part) {
        String overview = part.getOverview();
        if (overview != null && !overview.isBlank()) return overview;
        return part.getDisplayName();
    }

    private int expectedXp(int retrievalCount, boolean hasExplore) {
        int max = BASE_LESSON_XP + retrievalCount * XP_PER_CORRECT_RETRIEVAL;
        if (hasExplore) max += EXPLORE_XP;
        return max;
    }

    public record RetrievalAnswer(UUID structureId, boolean correct) {}

    @Transactional
    public LessonCompletionDto completeTodayLesson(UUID userId, List<RetrievalAnswer> answers) {
        LocalDate today = LocalDate.now();
        DailyLessonProgress lesson = lessonRepository.findByUserIdAndLessonDate(userId, today)
            .orElseThrow(() -> new IllegalStateException("No lesson for today; call GET /api/lessons/today first"));

        UserProfile profile = userProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new IllegalStateException("UserProfile missing for user " + userId));

        // Idempotent short-circuit.
        if (Boolean.TRUE.equals(lesson.getCompleted())) {
            return LessonCompletionDto.builder()
                .xpAwarded(lesson.getXpAwarded() == null ? 0 : lesson.getXpAwarded())
                .newXp(profile.getTotalXp() == null ? 0 : profile.getTotalXp())
                .streakDays(profile.getCurrentStreak() == null ? 0 : profile.getCurrentStreak())
                .etymologyRootId(lesson.getEtymologyRootId())
                .onboardingCompleted(Boolean.TRUE.equals(profile.getLearningActivated()))
                .build();
        }

        LocalDateTime now = LocalDateTime.now();

        // Index answers by structureId.
        Map<UUID, Boolean> answerByStructure = new HashMap<>();
        if (answers != null) {
            for (RetrievalAnswer a : answers) answerByStructure.put(a.structureId(), a.correct());
        }

        // Write retrieval outcomes.
        List<DailyLessonRetrievalItem> items =
            retrievalItemRepository.findByLessonIdOrderByDisplayOrderAsc(lesson.getId());
        int correctCount = 0;
        for (DailyLessonRetrievalItem item : items) {
            Boolean correct = answerByStructure.get(item.getStructureId());
            if (correct == null) continue;
            item.setAnsweredCorrectly(correct);
            item.setAnsweredAt(now);
            retrievalItemRepository.save(item);
            if (correct) correctCount++;

            // Update anatomy_structure_progress for this retrieval structure.
            AnatomyStructureProgress progress = structureProgressRepository
                .findByUserIdAndStructureId(userId, item.getStructureId())
                .orElseGet(() -> AnatomyStructureProgress.builder()
                    .userId(userId)
                    .structureId(item.getStructureId())
                    .firstSeenAt(now)
                    .firstSource("LESSON")
                    .build());
            progress.setLastReviewedAt(now);
            progress.setReviewCount(progress.getReviewCount() == null ? 1 : progress.getReviewCount() + 1);
            structureProgressRepository.save(progress);
        }

        // Mark explore structure Seen (but not Explored — etymology dwell is separate).
        UUID exploreId = lesson.getStructureExplored();
        if (exploreId != null) {
            AnatomyStructureProgress progress = structureProgressRepository
                .findByUserIdAndStructureId(userId, exploreId)
                .orElseGet(() -> AnatomyStructureProgress.builder()
                    .userId(userId)
                    .structureId(exploreId)
                    .firstSeenAt(now)
                    .firstSource("LESSON")
                    .build());
            structureProgressRepository.save(progress);
        }

        int xpAwarded = BASE_LESSON_XP
            + correctCount * XP_PER_CORRECT_RETRIEVAL
            + (exploreId != null ? EXPLORE_XP : 0);

        int existingXp = profile.getTotalXp() == null ? 0 : profile.getTotalXp();
        profile.setTotalXp(existingXp + xpAwarded);

        // Streak update (simple derived model — Sprint 26 hardens).
        LocalDate lastActive = profile.getLastActiveDate();
        int newStreak;
        if (lastActive == null) {
            newStreak = 1;
        } else if (lastActive.equals(today)) {
            newStreak = profile.getCurrentStreak() == null ? 1 : profile.getCurrentStreak();
        } else if (lastActive.plusDays(1).equals(today)) {
            newStreak = (profile.getCurrentStreak() == null ? 0 : profile.getCurrentStreak()) + 1;
        } else {
            newStreak = 1;
        }
        profile.setCurrentStreak(newStreak);
        profile.setLastActiveDate(today);

        // First-ever lesson completion activates progressive home.
        boolean firstEver = !Boolean.TRUE.equals(profile.getLearningActivated());
        if (firstEver) {
            profile.setLearningActivated(true);
        }

        userProfileRepository.save(profile);

        lesson.setCompleted(true);
        lesson.setCompletedAt(now);
        lesson.setXpAwarded(xpAwarded);
        lessonRepository.save(lesson);

        return LessonCompletionDto.builder()
            .xpAwarded(xpAwarded)
            .newXp(profile.getTotalXp())
            .streakDays(newStreak)
            .etymologyRootId(lesson.getEtymologyRootId())
            .onboardingCompleted(firstEver)
            .build();
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
        List<UUID> exploredIds = new ArrayList<>();
        for (AnatomyStructureProgress p : progress) {
            if (p.getExploredAt() != null) exploredIds.add(p.getStructureId());
        }
        List<String> exploredCanonicalIds = exploredIds.isEmpty()
            ? List.of()
            : anatomyPartRepository.findByIdIn(exploredIds).stream()
                .map(dev.traced.core.anatomy.entity.AnatomyPart::getCanonicalId)
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
            .exploredCanonicalIds(exploredCanonicalIds)
            .onboardingCompleted(onboardingCompleted)
            .build();
    }

    @SuppressWarnings("unused") // Used for future customisation.
    private Map<UUID, AnatomyStructureProgress> indexProgressById(List<AnatomyStructureProgress> rows) {
        Map<UUID, AnatomyStructureProgress> map = new HashMap<>();
        for (AnatomyStructureProgress p : rows) map.put(p.getStructureId(), p);
        return map;
    }

    @SuppressWarnings("unused")
    private Set<UUID> idSet(List<AnatomyPart> parts) {
        Set<UUID> out = new HashSet<>();
        for (AnatomyPart p : parts) out.add(p.getId());
        return out;
    }
}
