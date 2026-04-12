package dev.traced.core.multiplayer.service;

import org.springframework.stereotype.Service;

import java.util.Collection;

/**
 * Case-insensitive match with Levenshtein tolerance up to 2.
 * Pure computation — fully unit-testable.
 */
@Service
public class StringMatcher {

    public static final int DEFAULT_TOLERANCE = 2;

    public boolean matches(String input, Collection<String> candidates) {
        if (input == null || input.isBlank()) return false;
        String normInput = input.trim().toLowerCase();

        for (String candidate : candidates) {
            if (candidate == null) continue;
            String normCandidate = candidate.trim().toLowerCase();
            if (normCandidate.isEmpty()) continue;

            if (normInput.equals(normCandidate)) return true;
            if (levenshtein(normInput, normCandidate) <= DEFAULT_TOLERANCE) return true;
        }
        return false;
    }

    public int levenshtein(String a, String b) {
        int[][] dp = new int[a.length() + 1][b.length() + 1];
        for (int i = 0; i <= a.length(); i++) dp[i][0] = i;
        for (int j = 0; j <= b.length(); j++) dp[0][j] = j;

        for (int i = 1; i <= a.length(); i++) {
            for (int j = 1; j <= b.length(); j++) {
                int cost = a.charAt(i - 1) == b.charAt(j - 1) ? 0 : 1;
                dp[i][j] = Math.min(
                    Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
                    dp[i - 1][j - 1] + cost
                );
            }
        }
        return dp[a.length()][b.length()];
    }
}
