package dev.traced.core.leaderboard.service;

import dev.traced.core.leaderboard.dto.LeaderboardEntryDto;
import dev.traced.core.leaderboard.dto.MyRankDto;
import dev.traced.core.leaderboard.entity.WeeklyXpSnapshot;
import dev.traced.core.leaderboard.repository.WeeklyXpSnapshotRepository;
import dev.traced.core.profile.entity.UserProfile;
import dev.traced.core.profile.repository.UserProfileRepository;
import dev.traced.core.progression.service.LevelService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LeaderboardService {

    private final WeeklyXpSnapshotRepository snapshotRepository;
    private final UserProfileRepository userProfileRepository;
    private final WeeklyXpSnapshotService weeklyXpSnapshotService;
    private final LevelService levelService;

    public enum Period { WEEKLY, ALLTIME }

    public enum Scope { GLOBAL, UNIVERSITY, FRIENDS }

    public List<LeaderboardEntryDto> getGlobalWeekly(int page, int size, UUID myProfileId) {
        LocalDate monday = weeklyXpSnapshotService.currentWeekMonday();
        List<WeeklyXpSnapshot> all = snapshotRepository.findAllByWeekStartDate(monday);
        return rankAndPage(weeklyToEntries(all, myProfileId), page, size);
    }

    public List<LeaderboardEntryDto> getGlobalAllTime(int page, int size, UUID myProfileId) {
        List<UserProfile> all = userProfileRepository.findAll();
        List<UserProfile> sorted = new ArrayList<>(all);
        sorted.sort(Comparator
            .comparingInt(UserProfile::getTotalXp).reversed()
            .thenComparing(UserProfile::getJoinedAt));
        return rankAndPage(profilesToEntries(sorted, myProfileId), page, size);
    }

    public List<LeaderboardEntryDto> getUniversityWeekly(String university, int page, int size, UUID myProfileId) {
        if (university == null || university.isBlank()) return List.of();
        String filter = university.toLowerCase();
        LocalDate monday = weeklyXpSnapshotService.currentWeekMonday();
        List<WeeklyXpSnapshot> all = snapshotRepository.findAllByWeekStartDate(monday).stream()
            .filter(s -> s.getUserProfile().getUniversity() != null
                && s.getUserProfile().getUniversity().toLowerCase().equals(filter))
            .toList();
        return rankAndPage(weeklyToEntries(all, myProfileId), page, size);
    }

    public List<LeaderboardEntryDto> getUniversityAllTime(String university, int page, int size, UUID myProfileId) {
        if (university == null || university.isBlank()) return List.of();
        String filter = university.toLowerCase();
        List<UserProfile> sorted = userProfileRepository.findAll().stream()
            .filter(p -> p.getUniversity() != null && p.getUniversity().toLowerCase().equals(filter))
            .sorted(Comparator
                .comparingInt(UserProfile::getTotalXp).reversed()
                .thenComparing(UserProfile::getJoinedAt))
            .toList();
        return rankAndPage(profilesToEntries(sorted, myProfileId), page, size);
    }

    public MyRankDto getMyRank(UUID myProfileId, Scope scope, Period period) {
        List<LeaderboardEntryDto> full = fullList(scope, period, myProfileId, null);
        int myIndex = -1;
        for (int i = 0; i < full.size(); i++) {
            if (full.get(i).isMe()) {
                myIndex = i;
                break;
            }
        }
        if (myIndex == -1) {
            return MyRankDto.builder().me(null).surrounding(List.of()).build();
        }

        int from = Math.max(0, myIndex - 3);
        int to = Math.min(full.size(), myIndex + 4);
        List<LeaderboardEntryDto> surrounding = full.subList(from, to);
        return MyRankDto.builder()
            .me(full.get(myIndex))
            .surrounding(surrounding)
            .build();
    }

    // ---------- internal helpers ----------

    public List<LeaderboardEntryDto> fullList(Scope scope, Period period, UUID myProfileId, String filterUniversity) {
        if (scope == Scope.GLOBAL && period == Period.WEEKLY) {
            LocalDate monday = weeklyXpSnapshotService.currentWeekMonday();
            return weeklyToEntries(snapshotRepository.findAllByWeekStartDate(monday), myProfileId);
        }
        if (scope == Scope.GLOBAL && period == Period.ALLTIME) {
            List<UserProfile> sorted = new ArrayList<>(userProfileRepository.findAll());
            sorted.sort(Comparator
                .comparingInt(UserProfile::getTotalXp).reversed()
                .thenComparing(UserProfile::getJoinedAt));
            return profilesToEntries(sorted, myProfileId);
        }
        if (scope == Scope.UNIVERSITY && filterUniversity != null) {
            if (period == Period.WEEKLY) {
                return getUniversityWeekly(filterUniversity, 0, Integer.MAX_VALUE, myProfileId);
            } else {
                return getUniversityAllTime(filterUniversity, 0, Integer.MAX_VALUE, myProfileId);
            }
        }
        return List.of();
    }

    private List<LeaderboardEntryDto> weeklyToEntries(List<WeeklyXpSnapshot> snapshots, UUID myProfileId) {
        List<LeaderboardEntryDto> entries = new ArrayList<>();
        int rank = 1;
        for (WeeklyXpSnapshot s : snapshots) {
            UserProfile p = s.getUserProfile();
            int level = levelService.calculateLevel(p.getTotalXp());
            entries.add(LeaderboardEntryDto.builder()
                .rank(rank++)
                .displayName(p.getDisplayName())
                .xp(s.getXpEarnedThisWeek())
                .currentLevel(level)
                .currentStreak(p.getCurrentStreak())
                .university(p.getUniversity())
                .isMe(myProfileId != null && myProfileId.equals(p.getId()))
                .build());
        }
        return entries;
    }

    private List<LeaderboardEntryDto> profilesToEntries(List<UserProfile> profiles, UUID myProfileId) {
        List<LeaderboardEntryDto> entries = new ArrayList<>();
        int rank = 1;
        for (UserProfile p : profiles) {
            int level = levelService.calculateLevel(p.getTotalXp());
            entries.add(LeaderboardEntryDto.builder()
                .rank(rank++)
                .displayName(p.getDisplayName())
                .xp(p.getTotalXp())
                .currentLevel(level)
                .currentStreak(p.getCurrentStreak())
                .university(p.getUniversity())
                .isMe(myProfileId != null && myProfileId.equals(p.getId()))
                .build());
        }
        return entries;
    }

    private List<LeaderboardEntryDto> rankAndPage(List<LeaderboardEntryDto> entries, int page, int size) {
        int from = page * size;
        if (from >= entries.size()) return List.of();
        int to = Math.min(from + size, entries.size());
        return entries.subList(from, to);
    }
}
