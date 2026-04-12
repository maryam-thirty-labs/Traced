package dev.traced.core.leaderboard;

import dev.traced.core.leaderboard.service.WeeklyXpSnapshotService;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class WeeklyXpSnapshotServiceTest {

    private final WeeklyXpSnapshotService service = new WeeklyXpSnapshotService(null, null);

    @Test
    void monday_accepted() {
        // 2026-04-06 was a Monday
        assertDoesNotThrow(() -> service.assertIsMonday(LocalDate.of(2026, 4, 6)));
    }

    @Test
    void tuesday_rejected() {
        assertThrows(IllegalArgumentException.class,
            () -> service.assertIsMonday(LocalDate.of(2026, 4, 7)));
    }

    @Test
    void sunday_rejected() {
        assertThrows(IllegalArgumentException.class,
            () -> service.assertIsMonday(LocalDate.of(2026, 4, 5)));
    }

    @Test
    void currentWeekMonday_isMonday() {
        LocalDate monday = service.currentWeekMonday();
        assertEquals(java.time.DayOfWeek.MONDAY, monday.getDayOfWeek());
    }
}
