package dev.traced.core.relation;

import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class DiseaseTreatmentRelationTest {

    private static final Set<String> VALID_ROLES = Set.of(
        "CAUSE_TARGETING",
        "DISEASE_MODIFYING",
        "SYMPTOMATIC",
        "SUPPORTIVE",
        "PREVENTIVE"
    );

    @Test
    void validRoles_accepted() {
        for (String role : VALID_ROLES) {
            assertTrue(VALID_ROLES.contains(role));
        }
    }

    @Test
    void invalidRole_rejected() {
        assertFalse(VALID_ROLES.contains("CURATIVE"));
    }

    @Test
    void integerRole_rejected() {
        assertFalse(VALID_ROLES.contains("0"));
    }

    @Test
    void emptyRole_rejected() {
        assertFalse(VALID_ROLES.contains(""));
    }

    @Test
    void nullRole_rejected() {
        assertThrows(NullPointerException.class, () -> VALID_ROLES.contains(null));
    }

    @Test
    void allFiveRolesPresent() {
        assertEquals(5, VALID_ROLES.size());
    }
}
