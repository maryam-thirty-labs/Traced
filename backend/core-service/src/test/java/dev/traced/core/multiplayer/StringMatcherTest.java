package dev.traced.core.multiplayer;

import dev.traced.core.multiplayer.service.StringMatcher;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class StringMatcherTest {

    private final StringMatcher matcher = new StringMatcher();

    @Test
    void exact_match_accepted() {
        assertTrue(matcher.matches("gallbladder", List.of("Gallbladder")));
    }

    @Test
    void case_insensitive_match() {
        assertTrue(matcher.matches("GALLBLADDER", List.of("Gallbladder")));
        assertTrue(matcher.matches("GallBladder", List.of("gallbladder")));
    }

    @Test
    void one_typo_accepted() {
        // distance 1
        assertTrue(matcher.matches("galbladder", List.of("Gallbladder")));
    }

    @Test
    void two_typos_accepted() {
        // distance 2
        assertTrue(matcher.matches("galblader", List.of("Gallbladder")));
    }

    @Test
    void three_typos_rejected() {
        // distance 3
        assertFalse(matcher.matches("gblder", List.of("Gallbladder")));
    }

    @Test
    void synonym_accepted() {
        assertTrue(matcher.matches("cholecyst", List.of("Gallbladder", "Cholecyst", "GB")));
    }

    @Test
    void empty_rejected() {
        assertFalse(matcher.matches("", List.of("Gallbladder")));
        assertFalse(matcher.matches(null, List.of("Gallbladder")));
    }

    @Test
    void no_candidates_rejected() {
        assertFalse(matcher.matches("gallbladder", List.of()));
    }

    @Test
    void levenshtein_distance() {
        assertEquals(0, matcher.levenshtein("abc", "abc"));
        assertEquals(1, matcher.levenshtein("abc", "abd"));
        assertEquals(2, matcher.levenshtein("abc", "acd"));
        assertEquals(3, matcher.levenshtein("abc", "xyz"));
    }
}
