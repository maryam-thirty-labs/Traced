package dev.traced.core.progression.service;

import org.springframework.stereotype.Service;

@Service
public class LevelService {

    private static final int[] THRESHOLDS = {
        0,      // Lv1
        100,    // Lv2
        250,    // Lv3
        500,    // Lv4
        1000,   // Lv5
        1800,   // Lv6
        3000,   // Lv7
        5000,   // Lv8
        8000,   // Lv9
        12000,  // Lv10
    };

    private static final String[] TITLES = {
        "Novice",
        "Apprentice",
        "Student",
        "Practitioner",
        "Scholar",
        "Expert",
        "Specialist",
        "Authority",
        "Master",
        "Luminary",
    };

    public int calculateLevel(int totalXp) {
        int level = 1;
        for (int i = THRESHOLDS.length - 1; i >= 0; i--) {
            if (totalXp >= THRESHOLDS[i]) {
                level = i + 1;
                break;
            }
        }
        return level;
    }

    public String getLevelTitle(int level) {
        if (level < 1 || level > TITLES.length) {
            return TITLES[0];
        }
        return TITLES[level - 1];
    }

    public int getXpForNextLevel(int currentLevel) {
        if (currentLevel >= THRESHOLDS.length) {
            return THRESHOLDS[THRESHOLDS.length - 1];
        }
        return THRESHOLDS[currentLevel];
    }
}
