package dev.traced.core.progression;

import dev.traced.core.progression.service.LevelService;
import dev.traced.core.progression.service.UnlockService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UnlockServiceTest {

    private UnlockService unlockService;

    @BeforeEach
    void setUp() {
        unlockService = new UnlockService(new LevelService());
    }

    @Test
    void level1_onlyDigestive() {
        var systems = unlockService.getUnlockedSystems(1);
        assertEquals(1, systems.size());
        assertTrue(systems.contains("SYS_DIGESTIVE_001"));
        assertFalse(systems.contains("SYS_SKELETAL_001"));
    }

    @Test
    void level2_doesNotIncludeSkeletal() {
        var systems = unlockService.getUnlockedSystems(2);
        assertTrue(systems.contains("SYS_DIGESTIVE_001"));
        assertFalse(systems.contains("SYS_SKELETAL_001"));
    }

    @Test
    void level3_includesSkeletal() {
        var systems = unlockService.getUnlockedSystems(3);
        assertTrue(systems.contains("SYS_DIGESTIVE_001"));
        assertTrue(systems.contains("SYS_SKELETAL_001"));
        assertFalse(systems.contains("SYS_CARDIOVASCULAR_001"));
    }

    @Test
    void level5_includesCardiovascular() {
        var systems = unlockService.getUnlockedSystems(5);
        assertTrue(systems.contains("SYS_CARDIOVASCULAR_001"));
        assertEquals(3, systems.size());
    }

    @Test
    void level6_includesNervous() {
        var systems = unlockService.getUnlockedSystems(6);
        assertTrue(systems.contains("SYS_NERVOUS_001"));
        assertEquals(4, systems.size());
    }

    @Test
    void level8_includesRespiratory() {
        var systems = unlockService.getUnlockedSystems(8);
        assertTrue(systems.contains("SYS_RESPIRATORY_001"));
        assertEquals(5, systems.size());
    }

    @Test
    void level10_allFiveSystems() {
        var systems = unlockService.getUnlockedSystems(10);
        assertEquals(5, systems.size());
    }
}
