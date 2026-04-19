package dev.traced.core.cases.service;

import dev.traced.core.cases.dto.WeeklyCaseResponseDto;
import dev.traced.core.cases.entity.Case;
import dev.traced.core.cases.entity.WeeklyCase;
import dev.traced.core.cases.repository.CaseRepository;
import dev.traced.core.cases.repository.WeeklyCaseRepository;
import dev.traced.core.profile.entity.UserProfile;
import dev.traced.core.profile.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WeeklyCaseService {

    public static final int STREAK_REQUIRED = 3;

    private final WeeklyCaseRepository weeklyCaseRepository;
    private final CaseRepository caseRepository;
    private final UserProfileRepository userProfileRepository;
    private final CaseService caseService;

    @Transactional(readOnly = true)
    public WeeklyCaseResponseDto getCurrentWeekCase(UUID userId) {
        int currentStreak = userProfileRepository.findByUserId(userId)
            .map(UserProfile::getCurrentStreak)
            .orElse(0);

        if (currentStreak < STREAK_REQUIRED) {
            return WeeklyCaseResponseDto.builder()
                .available(false)
                .streakRequired(STREAK_REQUIRED)
                .currentStreak(currentStreak)
                .caseDetail(null)
                .build();
        }

        LocalDate weekStart = LocalDate.now().with(DayOfWeek.MONDAY);
        Optional<WeeklyCase> schedule = weeklyCaseRepository.findByWeekStart(weekStart);
        if (schedule.isEmpty()) {
            return WeeklyCaseResponseDto.builder()
                .available(false)
                .streakRequired(STREAK_REQUIRED)
                .currentStreak(currentStreak)
                .caseDetail(null)
                .build();
        }

        Optional<Case> theCase = caseRepository.findById(schedule.get().getCaseId());
        if (theCase.isEmpty()) {
            return WeeklyCaseResponseDto.builder()
                .available(false)
                .streakRequired(STREAK_REQUIRED)
                .currentStreak(currentStreak)
                .caseDetail(null)
                .build();
        }

        return WeeklyCaseResponseDto.builder()
            .available(true)
            .streakRequired(STREAK_REQUIRED)
            .currentStreak(currentStreak)
            .caseDetail(caseService.getCaseDetail(theCase.get().getCaseId()))
            .build();
    }
}
