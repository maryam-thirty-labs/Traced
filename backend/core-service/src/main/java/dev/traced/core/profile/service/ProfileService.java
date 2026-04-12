package dev.traced.core.profile.service;

import dev.traced.core.cases.repository.CaseAttemptRepository;
import dev.traced.core.common.EntityNotFoundException;
import dev.traced.core.profile.dto.PreferencesRequest;
import dev.traced.core.profile.dto.ProgressDto;
import dev.traced.core.profile.dto.UserProfileDto;
import dev.traced.core.profile.entity.UserProfile;
import dev.traced.core.profile.repository.UserProfileRepository;
import dev.traced.core.progression.repository.MasteryRecordRepository;
import dev.traced.core.progression.service.LevelService;
import dev.traced.core.progression.service.UnlockService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProfileService {

    private final UserProfileRepository userProfileRepository;
    private final MasteryRecordRepository masteryRecordRepository;
    private final CaseAttemptRepository caseAttemptRepository;
    private final LevelService levelService;
    private final UnlockService unlockService;

    public UserProfileDto getProfile(UUID userId) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new EntityNotFoundException("UserProfile", userId.toString()));

        int level = levelService.calculateLevel(profile.getTotalXp());

        return UserProfileDto.builder()
            .displayName(profile.getDisplayName())
            .totalXp(profile.getTotalXp())
            .currentLevel(level)
            .levelTitle(levelService.getLevelTitle(level))
            .currentStreak(profile.getCurrentStreak())
            .unlockedSystems(unlockService.getUnlockedSystems(level))
            .etymologyEnabled(profile.getEtymologyEnabled())
            .university(profile.getUniversity())
            .build();
    }

    public ProgressDto getProgress(UUID userId) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new EntityNotFoundException("UserProfile", userId.toString()));

        int level = levelService.calculateLevel(profile.getTotalXp());
        int xpToNext = levelService.getXpForNextLevel(level) - profile.getTotalXp();

        var masteryRecords = masteryRecordRepository.findByUserProfileId(profile.getId())
            .stream()
            .map(r -> ProgressDto.MasteryDto.builder()
                .systemCanonicalId(r.getSystemCanonicalId())
                .masteryPct(r.getMasteryPct())
                .casesAttempted(r.getCasesAttempted())
                .casesCorrect(r.getCasesCorrect())
                .build()
            ).toList();

        var recentAttempts = caseAttemptRepository.findByUserProfileId(profile.getId())
            .stream()
            .sorted((a, b) -> b.getCompletedAt().compareTo(a.getCompletedAt()))
            .limit(10)
            .map(a -> ProgressDto.RecentAttemptDto.builder()
                .caseId(a.getLinkedCase().getCaseId())
                .caseTitle(a.getLinkedCase().getTitle())
                .outcome(a.getOutcome())
                .score(a.getScore())
                .xpAwarded(a.getXpAwarded())
                .completedAt(a.getCompletedAt())
                .build()
            ).toList();

        // Suggested next: most recently failed case first
        String suggestedNext = recentAttempts.stream()
            .filter(a -> "INCORRECT".equals(a.outcome()))
            .map(ProgressDto.RecentAttemptDto::caseId)
            .findFirst()
            .orElse(null);

        return ProgressDto.builder()
            .totalXp(profile.getTotalXp())
            .currentLevel(level)
            .xpToNextLevel(Math.max(xpToNext, 0))
            .masteryRecords(masteryRecords)
            .recentAttempts(recentAttempts)
            .suggestedNext(suggestedNext)
            .build();
    }

    @Transactional
    public void updatePreferences(UUID userId, PreferencesRequest request) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new EntityNotFoundException("UserProfile", userId.toString()));

        if (request.etymologyEnabled() != null) {
            profile.setEtymologyEnabled(request.etymologyEnabled());
        }
        if (request.preferredSystem() != null) {
            profile.setPreferredSystem(request.preferredSystem());
        }
        if (request.university() != null) {
            profile.setUniversity(request.university());
        }
        userProfileRepository.save(profile);
    }

    @Transactional
    public void resetProgress(UUID userId) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new EntityNotFoundException("UserProfile", userId.toString()));

        // Delete CaseAttempts and MasteryRecords
        caseAttemptRepository.findByUserProfileId(profile.getId())
            .forEach(a -> caseAttemptRepository.delete(a));
        masteryRecordRepository.findByUserProfileId(profile.getId())
            .forEach(m -> masteryRecordRepository.delete(m));

        // Reset XP and streak — preserve UserProfile row
        profile.setTotalXp(0);
        profile.setCurrentStreak(0);
        userProfileRepository.save(profile);
    }
}
