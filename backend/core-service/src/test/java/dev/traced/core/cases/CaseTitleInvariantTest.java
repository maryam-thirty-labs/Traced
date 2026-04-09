package dev.traced.core.cases;

import dev.traced.core.cases.exception.CaseTitleViolationException;
import dev.traced.core.cases.repository.CaseRepository;
import dev.traced.core.cases.service.CaseService;
import dev.traced.core.disease.entity.Disease;
import dev.traced.core.disease.repository.DiseaseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CaseTitleInvariantTest {

    @Mock
    private CaseRepository caseRepository;
    @Mock
    private DiseaseRepository diseaseRepository;

    private CaseService caseService;

    private final UUID diseaseId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        caseService = new CaseService(caseRepository, null, null, diseaseRepository);
    }

    private Disease disease(String name) {
        return Disease.builder()
            .id(diseaseId)
            .canonicalId("DIS_TEST_001")
            .name(name)
            .commonness("COMMON")
            .build();
    }

    @Test
    void titleContainingDiseaseNameExact_throws422() {
        when(diseaseRepository.findById(diseaseId)).thenReturn(Optional.of(disease("Cholecystitis")));
        assertThrows(CaseTitleViolationException.class,
            () -> caseService.validateTitle("Cholecystitis case", diseaseId));
    }

    @Test
    void titleContainingDiseaseNameCaseInsensitive_throws422() {
        when(diseaseRepository.findById(diseaseId)).thenReturn(Optional.of(disease("Cholecystitis")));
        assertThrows(CaseTitleViolationException.class,
            () -> caseService.validateTitle("A CHOLECYSTITIS Mystery", diseaseId));
    }

    @Test
    void titleContainingDiseaseNameLowercase_throws422() {
        when(diseaseRepository.findById(diseaseId)).thenReturn(Optional.of(disease("Cholelithiasis")));
        assertThrows(CaseTitleViolationException.class,
            () -> caseService.validateTitle("the cholelithiasis problem", diseaseId));
    }

    @Test
    void cleanTitle_passes() {
        when(diseaseRepository.findById(diseaseId)).thenReturn(Optional.of(disease("Cholecystitis")));
        assertDoesNotThrow(() -> caseService.validateTitle("The Holiday Feast", diseaseId));
    }

    @Test
    void unrelatedTitle_passes() {
        when(diseaseRepository.findById(diseaseId)).thenReturn(Optional.of(disease("Cholangitis")));
        assertDoesNotThrow(() -> caseService.validateTitle("Yellow and confused", diseaseId));
    }
}
