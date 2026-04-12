package dev.traced.core.chat;

import dev.traced.core.chat.service.ChatChannelService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ChatChannelServiceTest {

    @Test
    void valid_slug_accepted() {
        assertDoesNotThrow(() -> ChatChannelService.validateSlug("general"));
        assertDoesNotThrow(() -> ChatChannelService.validateSlug("digestive-system"));
        assertDoesNotThrow(() -> ChatChannelService.validateSlug("study-tips-v2"));
    }

    @Test
    void uppercase_rejected() {
        assertThrows(IllegalArgumentException.class,
            () -> ChatChannelService.validateSlug("General"));
    }

    @Test
    void spaces_rejected() {
        assertThrows(IllegalArgumentException.class,
            () -> ChatChannelService.validateSlug("My Channel"));
    }

    @Test
    void underscores_rejected() {
        assertThrows(IllegalArgumentException.class,
            () -> ChatChannelService.validateSlug("my_channel"));
    }

    @Test
    void empty_rejected() {
        assertThrows(IllegalArgumentException.class,
            () -> ChatChannelService.validateSlug(""));
    }

    @Test
    void null_rejected() {
        assertThrows(IllegalArgumentException.class,
            () -> ChatChannelService.validateSlug(null));
    }

    @Test
    void leading_trailing_hyphen_rejected() {
        assertThrows(IllegalArgumentException.class,
            () -> ChatChannelService.validateSlug("-general"));
        assertThrows(IllegalArgumentException.class,
            () -> ChatChannelService.validateSlug("general-"));
    }

    @Test
    void toSlug_converts_display_name() {
        assertEquals("my-channel", ChatChannelService.toSlug("My Channel"));
        assertEquals("digestive-system", ChatChannelService.toSlug("Digestive  System"));
        assertEquals("study-tips-2025", ChatChannelService.toSlug("Study Tips 2025!"));
    }
}
