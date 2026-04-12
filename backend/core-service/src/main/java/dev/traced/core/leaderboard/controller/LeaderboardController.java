package dev.traced.core.leaderboard.controller;

import dev.traced.core.common.EntityNotFoundException;
import dev.traced.core.leaderboard.dto.LeaderboardEntryDto;
import dev.traced.core.leaderboard.dto.MyRankDto;
import dev.traced.core.leaderboard.service.LeaderboardService;
import dev.traced.core.leaderboard.service.LeaderboardService.Period;
import dev.traced.core.leaderboard.service.LeaderboardService.Scope;
import dev.traced.core.profile.entity.UserProfile;
import dev.traced.core.profile.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;
    private final UserProfileRepository userProfileRepository;

    private UUID resolveProfileId(Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        UserProfile p = userProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new EntityNotFoundException("UserProfile", userId.toString()));
        return p.getId();
    }

    private Period parsePeriod(String period) {
        if (period == null || period.isBlank() || "weekly".equalsIgnoreCase(period)) return Period.WEEKLY;
        if ("alltime".equalsIgnoreCase(period)) return Period.ALLTIME;
        throw new IllegalArgumentException("Unknown period: " + period + " (use weekly or alltime)");
    }

    @GetMapping("/global")
    public ResponseEntity<List<LeaderboardEntryDto>> getGlobal(
        Authentication auth,
        @RequestParam(required = false) String period,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        UUID myProfileId = resolveProfileId(auth);
        Period p = parsePeriod(period);
        List<LeaderboardEntryDto> results = p == Period.WEEKLY
            ? leaderboardService.getGlobalWeekly(page, size, myProfileId)
            : leaderboardService.getGlobalAllTime(page, size, myProfileId);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/university")
    public ResponseEntity<List<LeaderboardEntryDto>> getUniversity(
        Authentication auth,
        @RequestParam(required = false) String period,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        UUID myProfileId = resolveProfileId(auth);
        UserProfile me = userProfileRepository.findById(myProfileId).orElseThrow();
        String university = me.getUniversity();
        Period p = parsePeriod(period);
        List<LeaderboardEntryDto> results = p == Period.WEEKLY
            ? leaderboardService.getUniversityWeekly(university, page, size, myProfileId)
            : leaderboardService.getUniversityAllTime(university, page, size, myProfileId);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/friends")
    public ResponseEntity<List<LeaderboardEntryDto>> getFriends(
        Authentication auth,
        @RequestParam(required = false) String period
    ) {
        UUID myProfileId = resolveProfileId(auth);
        Period p = parsePeriod(period);
        List<LeaderboardEntryDto> results = p == Period.WEEKLY
            ? leaderboardService.getFriendsWeekly(myProfileId)
            : leaderboardService.getFriendsAllTime(myProfileId);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/me")
    public ResponseEntity<MyRankDto> getMyRank(
        Authentication auth,
        @RequestParam(required = false) String period,
        @RequestParam(required = false) String scope
    ) {
        UUID myProfileId = resolveProfileId(auth);
        Period p = parsePeriod(period);
        Scope s = Scope.GLOBAL;
        if (scope != null) {
            try {
                s = Scope.valueOf(scope.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Unknown scope: " + scope);
            }
        }
        return ResponseEntity.ok(leaderboardService.getMyRank(myProfileId, s, p));
    }
}
