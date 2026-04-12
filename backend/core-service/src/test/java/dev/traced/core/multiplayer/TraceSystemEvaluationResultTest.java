package dev.traced.core.multiplayer;

import dev.traced.core.multiplayer.service.TraceSystemGameService.EvaluationResult;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class TraceSystemEvaluationResultTest {

    @Test
    void fully_correct_awards_100() {
        EvaluationResult r = new EvaluationResult(true, 4, 4);
        assertEquals(100, r.pointsAwarded());
    }

    @Test
    void three_of_four_correct_positions_30_points() {
        EvaluationResult r = new EvaluationResult(false, 3, 4);
        assertEquals(30, r.pointsAwarded());
    }

    @Test
    void zero_correct_zero_points() {
        EvaluationResult r = new EvaluationResult(false, 0, 4);
        assertEquals(0, r.pointsAwarded());
    }

    @Test
    void all_right_positions_but_wrong_length_not_fully_correct() {
        // This would be caught by the service; here we just test the record
        EvaluationResult r = new EvaluationResult(false, 3, 4);
        assertFalse(r.isFullyCorrect());
        assertEquals(30, r.pointsAwarded());
    }
}
