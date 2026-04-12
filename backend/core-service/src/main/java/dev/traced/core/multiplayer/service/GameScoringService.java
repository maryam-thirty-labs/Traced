package dev.traced.core.multiplayer.service;

import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;

/**
 * Pure computation — no repository interaction.
 * pointsAwarded = 100 for correct, decrementing by 10 per second, floor at 10.
 */
@Service
public class GameScoringService {

    public static final int BASE_POINTS = 100;
    public static final int FLOOR_POINTS = 10;
    public static final int DECREMENT_PER_SECOND = 10;
    public static final int ROUND_TIMER_SECONDS = 30;

    public int calculatePoints(boolean isCorrect, LocalDateTime roundStartedAt, LocalDateTime answeredAt) {
        if (!isCorrect) return 0;

        long secondsElapsed = Duration.between(roundStartedAt, answeredAt).toSeconds();
        if (secondsElapsed < 0) secondsElapsed = 0;

        // Past timer window — still correct but no points
        if (secondsElapsed > ROUND_TIMER_SECONDS) return 0;

        int points = BASE_POINTS - (int) (secondsElapsed * DECREMENT_PER_SECOND);
        return Math.max(points, FLOOR_POINTS);
    }
}
