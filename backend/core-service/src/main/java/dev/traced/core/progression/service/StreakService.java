package dev.traced.core.progression.service;

import dev.traced.core.profile.entity.UserProfile;
import dev.traced.core.profile.repository.UserProfileRepository;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.Locale;
import java.util.UUID;

/**
 * Derived streak model. No cron mutates streak truth. Validity is computed
 * from last_active_date + current_streak_days at read time; resets lazily
 * on the next read or completion event when a gap is detected.
 */
@Service
@RequiredArgsConstructor
public class StreakService {

    public static final int FREEZE_COST_XP = 50;

    private final UserProfileRepository userProfileRepository;

    @Transactional
    public StreakDto getStreak(UUID userId) {
        UserProfile profile = userProfileRepository.findByUserId(userId).orElse(null);
        if (profile == null) {
            return StreakDto.builder().days(0).freezeAvailable(false).frozenUntil(null).build();
        }

        int days = deriveValidStreak(profile, LocalDate.now());
        int current = profile.getCurrentStreak() == null ? 0 : profile.getCurrentStreak();
        if (days != current) {
            profile.setCurrentStreak(days);
            userProfileRepository.save(profile);
        }

        return StreakDto.builder()
            .days(days)
            .freezeAvailable(isFreezeAvailableThisWeek(profile, LocalDate.now()))
            .frozenUntil(null)
            .build();
    }

    /**
     * Spend 50 XP to save a streak after a single missed day.
     * Allowed at most once per ISO week.
     */
    @Transactional
    public StreakDto useFreeze(UUID userId) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new IllegalArgumentException("UserProfile not found"));

        LocalDate today = LocalDate.now();
        int currentWeek = isoWeek(today);

        if (!isFreezeAvailableThisWeek(profile, today)) {
            throw new IllegalStateException("Streak freeze already used this week");
        }
        LocalDate last = profile.getLastActiveDate();
        if (last == null || daysBetween(last, today) != 2) {
            throw new IllegalStateException("Freeze only applies when exactly one day was missed");
        }
        if ((profile.getTotalXp() == null ? 0 : profile.getTotalXp()) < FREEZE_COST_XP) {
            throw new IllegalStateException("Not enough XP for freeze");
        }

        profile.setTotalXp(profile.getTotalXp() - FREEZE_COST_XP);
        profile.setStreakFreezeUsedWeek(currentWeek);
        // Keep current_streak unchanged; advance last_active_date by 1 day
        // so the streak stays valid.
        profile.setLastActiveDate(last.plusDays(1));
        userProfileRepository.save(profile);

        return getStreak(userId);
    }

    /**
     * days == 0 when the streak is broken.
     * 0-day gap (today) → current value
     * 1-day gap (yesterday) → current value (still valid — last lesson was yesterday)
     * 2+-day gap → 0 (broken)
     */
    private int deriveValidStreak(UserProfile profile, LocalDate today) {
        Integer current = profile.getCurrentStreak();
        LocalDate last = profile.getLastActiveDate();
        int cur = current == null ? 0 : current;
        if (last == null) return 0;
        long gap = daysBetween(last, today);
        if (gap <= 1) return cur;
        return 0;
    }

    private boolean isFreezeAvailableThisWeek(UserProfile profile, LocalDate today) {
        if (!Boolean.TRUE.equals(profile.getStreakFreezeAvailable())) return false;
        Integer usedWeek = profile.getStreakFreezeUsedWeek();
        if (usedWeek == null) return true;
        return usedWeek != isoWeek(today);
    }

    private static long daysBetween(LocalDate a, LocalDate b) {
        return java.time.temporal.ChronoUnit.DAYS.between(a, b);
    }

    private static int isoWeek(LocalDate date) {
        return date.get(WeekFields.of(Locale.UK).weekOfWeekBasedYear())
            + 100 * date.get(WeekFields.of(Locale.UK).weekBasedYear());
    }

    @Builder
    public record StreakDto(int days, boolean freezeAvailable, LocalDate frozenUntil) {}

    @SuppressWarnings("unused") // retained to silence the unused import on DayOfWeek.
    private static final DayOfWeek WEEK_ANCHOR = DayOfWeek.MONDAY;
}
