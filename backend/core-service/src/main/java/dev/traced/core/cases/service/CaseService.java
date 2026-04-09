package dev.traced.core.cases.service;

import dev.traced.core.cases.entity.Case;
import dev.traced.core.cases.exception.CaseTitleViolationException;
import dev.traced.core.cases.repository.CaseRepository;
import dev.traced.core.common.EntityNotFoundException;
import dev.traced.core.disease.entity.Disease;
import dev.traced.core.disease.repository.DiseaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CaseService {

    private final CaseRepository caseRepository;
    private final DiseaseRepository diseaseRepository;

    public void validateTitle(String title, UUID linkedDiseaseId) {
        Disease disease = diseaseRepository.findById(linkedDiseaseId)
            .orElseThrow(() -> new EntityNotFoundException("Disease", linkedDiseaseId.toString()));

        if (title.toLowerCase().contains(disease.getName().toLowerCase())) {
            throw new CaseTitleViolationException(title, disease.getName());
        }
    }

    @Transactional(readOnly = true)
    public Case findByCaseId(String caseId) {
        return caseRepository.findByCaseId(caseId)
            .orElseThrow(() -> new EntityNotFoundException("Case", caseId));
    }
}
