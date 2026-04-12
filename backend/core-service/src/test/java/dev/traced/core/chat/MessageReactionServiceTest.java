package dev.traced.core.chat;

import dev.traced.core.chat.service.MessageReactionService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class MessageReactionServiceTest {

    @Test
    void all_six_allowed_emojis_accepted() {
        assertDoesNotThrow(() -> MessageReactionService.validateEmoji("fire"));
        assertDoesNotThrow(() -> MessageReactionService.validateEmoji("brain"));
        assertDoesNotThrow(() -> MessageReactionService.validateEmoji("check"));
        assertDoesNotThrow(() -> MessageReactionService.validateEmoji("laugh"));
        assertDoesNotThrow(() -> MessageReactionService.validateEmoji("question"));
        assertDoesNotThrow(() -> MessageReactionService.validateEmoji("heart"));
    }

    @Test
    void unknown_emoji_rejected() {
        assertThrows(IllegalArgumentException.class,
            () -> MessageReactionService.validateEmoji("thumbs-up"));
    }

    @Test
    void unicode_emoji_rejected() {
        // Raw fire emoji glyph — must reject since we only accept labels
        assertThrows(IllegalArgumentException.class,
            () -> MessageReactionService.validateEmoji("\uD83D\uDD25"));
    }

    @Test
    void null_rejected() {
        assertThrows(IllegalArgumentException.class,
            () -> MessageReactionService.validateEmoji(null));
    }

    @Test
    void exactly_six_allowed_emojis() {
        assertEquals(6, MessageReactionService.ALLOWED_EMOJIS.size());
    }
}
