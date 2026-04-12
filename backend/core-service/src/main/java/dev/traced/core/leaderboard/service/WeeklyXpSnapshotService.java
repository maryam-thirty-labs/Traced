package dev.traced.core.leaderboard.service;

import dev.traced.core.cases.entity.CaseAttempt;
import dev.traced.core.cases.repository.CaseAttemptRepository;
import dev.traced.core.leaderboard.entity.WeeklyXpSnapshot;
import dev.traced.core.leaderboard.repository.WeeklyXpSnapshotRepository;
import dev.traced.core.profile.entity.UserProfile;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.temporal.TemporalAdjusters;

@Service
@RequiredArgsConstructor
public class WeeklyXpSnapshotService {

    private final WeeklyXpSnapshotRepository snapshotRepository;
    private final CaseAttemptRepository caseAttemptRepository;

    public LocalDate currentWeekMonday() {
        return LocalDate.now(ZoneOffset.UTC).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }

    public void assertIsMonday(LocalDate date) {
        if (date.getDayOfWeek() != DayOfWeek.MONDAY) {
            throw new IllegalArgumentException("weekStartDate must be a Monday, got " + date.getDayOfWeek());
        }
    }

    @Transactional
    public WeeklyXpSnapshot generateForCurrentWeek(UserProfile userProfile) {
        LocalDate monday = currentWeekMonday();
        return upsertForWeek(userProfile, monday);
    }

    @Transactional
    public WeeklyXpSnapshot upsertForWeek(UserProfile userProfile, LocalDate weekStartDate) {
        assertIsMonday(weekStartDate);

        LocalDateTime weekStart = weekStartDate.atStartOfDay();
        LocalDateTime weekEnd = weekStart.plusDays(7);

        int xpThisWeek = caseAttemptRepository.findByUserProfileId(userProfile.getId())
            .stream()
            .filter(a -> a.getCompletedAt() != null)
            .filter(a -> !a.getCompletedAt().isBefore(weekStart) && a.getCompletedAt().isBefore(weekEnd))
            .mapToInt(CaseAttempt::getXpAwarded)
            .sum();

        WeeklyXpSnapshot snapshot = snapshotRepository
            .findByUserProfileIdAndWeekStartDate(userProfile.getId(), weekStartDate)
            .orElseGet(() -> WeeklyXpSnapshot.builder()
                .userProfile(userProfile)
                .weekStartDate(weekStartDate)
                .xpEarnedThisWeek(0)
                .archived(false)
                .build()
            );

        snapshot.setXpEarnedThisWeek(xpThisWeek);
        return snapshotRepository.save(snapshot);
    }
}
