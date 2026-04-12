package dev.traced.core.multiplayer;

import dev.traced.core.multiplayer.service.GameScoringService;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class GameScoringServiceTest {

    private final GameScoringService scoring = new GameScoringService();
    private final LocalDateTime start = LocalDateTime.of(2026, 4, 12, 12, 0, 0);

    @Test
    void incorrect_answer_zero_points() {
        assertEquals(0, scoring.calculatePoints(false, start, start.plusSeconds(5)));
    }

    @Test
    void immediate_correct_gets_100() {
        assertEquals(100, scoring.calculatePoints(true, start, start));
    }

    @Test
    void after_one_second_90_points() {
        assertEquals(90, scoring.calculatePoints(true, start, start.plusSeconds(1)));
    }

    @Test
    void after_five_seconds_50_points() {
        assertEquals(50, scoring.calculatePoints(true, start, start.plusSeconds(5)));
    }

    @Test
    void after_nine_seconds_10_points_floor() {
        assertEquals(10, scoring.calculatePoints(true, start, start.plusSeconds(9)));
    }

    @Test
    void after_twenty_seconds_10_points_floor() {
        // Still within timer, still correct, floored at 10
        assertEquals(10, scoring.calculatePoints(true, start, start.plusSeconds(20)));
    }

    @Test
    void after_timer_expired_zero_points() {
        // Timer is 30s
        assertEquals(0, scoring.calculatePoints(true, start, start.plusSeconds(35)));
    }
}
