package dev.traced.core.progression;

import dev.traced.core.progression.service.LevelService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class LevelServiceTest {

    private LevelService levelService;

    @BeforeEach
    void setUp() {
        levelService = new LevelService();
    }

    @Test
    void zeroXp_returnsLevel1() {
        assertEquals(1, levelService.calculateLevel(0));
    }

    @Test
    void xp99_returnsLevel1() {
        assertEquals(1, levelService.calculateLevel(99));
    }

    @Test
    void xp100_returnsLevel2() {
        assertEquals(2, levelService.calculateLevel(100));
    }

    @Test
    void xp249_returnsLevel2() {
        assertEquals(2, levelService.calculateLevel(249));
    }

    @Test
    void xp250_returnsLevel3() {
        assertEquals(3, levelService.calculateLevel(250));
    }

    @Test
    void xp499_returnsLevel3() {
        assertEquals(3, levelService.calculateLevel(499));
    }

    @Test
    void xp500_returnsLevel4() {
        assertEquals(4, levelService.calculateLevel(500));
    }

    @Test
    void xp999_returnsLevel4() {
        assertEquals(4, levelService.calculateLevel(999));
    }

    @Test
    void xp1000_returnsLevel5() {
        assertEquals(5, levelService.calculateLevel(1000));
    }

    @Test
    void xp1799_returnsLevel5() {
        assertEquals(5, levelService.calculateLevel(1799));
    }

    @Test
    void xp1800_returnsLevel6() {
        assertEquals(6, levelService.calculateLevel(1800));
    }

    @Test
    void xp3000_returnsLevel7() {
        assertEquals(7, levelService.calculateLevel(3000));
    }

    @Test
    void xp5000_returnsLevel8() {
        assertEquals(8, levelService.calculateLevel(5000));
    }

    @Test
    void xp8000_returnsLevel9() {
        assertEquals(9, levelService.calculateLevel(8000));
    }

    @Test
    void xp12000_returnsLevel10() {
        assertEquals(10, levelService.calculateLevel(12000));
    }

    @Test
    void xp99999_returnsLevel10() {
        assertEquals(10, levelService.calculateLevel(99999));
    }

    @Test
    void levelTitles_correctForEachLevel() {
        assertEquals("Novice", levelService.getLevelTitle(1));
        assertEquals("Apprentice", levelService.getLevelTitle(2));
        assertEquals("Student", levelService.getLevelTitle(3));
        assertEquals("Practitioner", levelService.getLevelTitle(4));
        assertEquals("Scholar", levelService.getLevelTitle(5));
        assertEquals("Expert", levelService.getLevelTitle(6));
        assertEquals("Specialist", levelService.getLevelTitle(7));
        assertEquals("Authority", levelService.getLevelTitle(8));
        assertEquals("Master", levelService.getLevelTitle(9));
        assertEquals("Luminary", levelService.getLevelTitle(10));
    }
}
