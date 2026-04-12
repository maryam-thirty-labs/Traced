package dev.traced.core.leaderboard.service;

import dev.traced.core.leaderboard.entity.WeeklyXpSnapshot;
import dev.traced.core.leaderboard.repository.WeeklyXpSnapshotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class WeeklyResetJob {

    private final WeeklyXpSnapshotRepository snapshotRepository;

    /**
     * Runs every Monday at 00:01 UTC.
     * Archives all snapshots from the previous week (sets archived = true).
     * Does NOT delete rows — keeps history.
     * Does NOT reset totalXp on user_profiles — all-time is cumulative.
     */
    @Scheduled(cron = "0 1 0 ? * MON", zone = "UTC")
    @Transactional
    public void archivePreviousWeek() {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        LocalDate previousMonday = today.with(TemporalAdjusters.previous(DayOfWeek.MONDAY));
        archiveWeek(previousMonday);
    }

    @Transactional
    public int archiveWeek(LocalDate weekStartDate) {
        List<WeeklyXpSnapshot> snapshots = snapshotRepository.findByWeekStartDateAndArchivedFalse(weekStartDate);
        for (WeeklyXpSnapshot s : snapshots) {
            s.setArchived(true);
        }
        snapshotRepository.saveAll(snapshots);
        log.info("Archived {} weekly snapshots for week starting {}", snapshots.size(), weekStartDate);
        return snapshots.size();
    }
}
