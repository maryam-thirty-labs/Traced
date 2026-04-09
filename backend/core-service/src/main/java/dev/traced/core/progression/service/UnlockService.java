package dev.traced.core.progression.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UnlockService {

    private static final List<Map.Entry<Integer, String>> UNLOCK_THRESHOLDS = List.of(
        Map.entry(1,  "SYS_DIGESTIVE_001"),
        Map.entry(3,  "SYS_SKELETAL_001"),
        Map.entry(5,  "SYS_CARDIOVASCULAR_001"),
        Map.entry(6,  "SYS_NERVOUS_001"),
        Map.entry(8,  "SYS_RESPIRATORY_001")
    );

    private final LevelService levelService;

    public List<String> getUnlockedSystems(int level) {
        List<String> unlocked = new ArrayList<>();
        for (var entry : UNLOCK_THRESHOLDS) {
            if (level >= entry.getKey()) {
                unlocked.add(entry.getValue());
            }
        }
        return unlocked;
    }

    public List<String> getUnlockedSystemsForXp(int totalXp) {
        return getUnlockedSystems(levelService.calculateLevel(totalXp));
    }
}
