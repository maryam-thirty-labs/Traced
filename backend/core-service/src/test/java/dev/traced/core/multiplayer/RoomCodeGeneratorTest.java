package dev.traced.core.multiplayer;

import dev.traced.core.multiplayer.service.RoomCodeGenerator;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class RoomCodeGeneratorTest {

    @Test
    void randomCode_is_six_uppercase_chars() {
        RoomCodeGenerator gen = new RoomCodeGenerator(null);
        for (int i = 0; i < 100; i++) {
            String code = gen.randomCode();
            assertEquals(6, code.length());
            assertEquals(code.toUpperCase(), code);
            // Alphabet excludes 0, O, 1, I
            assertFalse(code.contains("0"));
            assertFalse(code.contains("O"));
            assertFalse(code.contains("1"));
            assertFalse(code.contains("I"));
        }
    }
}
