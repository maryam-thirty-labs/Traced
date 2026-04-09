package dev.traced.core.cases.service;

import dev.traced.core.cases.dto.CaseDetailDto;
import dev.traced.core.cases.dto.CaseSummaryDto;
import dev.traced.core.cases.entity.*;
import dev.traced.core.cases.exception.CaseTitleViolationException;
import dev.traced.core.cases.repository.CaseOptionRepository;
import dev.traced.core.cases.repository.CaseQuestionRepository;
import dev.traced.core.cases.repository.CaseRepository;
import dev.traced.core.common.EntityNotFoundException;
import dev.traced.core.disease.entity.Disease;
import dev.traced.core.disease.repository.DiseaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CaseService {

    private final CaseRepository caseRepository;
    private final CaseQuestionRepository caseQuestionRepository;
    private final CaseOptionRepository caseOptionRepository;
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

    @Transactional(readOnly = true)
    public CaseDetailDto getCaseDetail(String caseId) {
        Case c = findByCaseId(caseId);

        List<CaseQuestion> questions = caseQuestionRepository.findByLinkedCaseIdOrderByStepNumber(c.getId());

        List<CaseDetailDto.QuestionDto> questionDtos = questions.stream().map(q -> {
            List<CaseOption> options = caseOptionRepository.findByQuestionId(q.getId());
            return CaseDetailDto.QuestionDto.builder()
                .questionId(q.getId().toString())
                .stepNumber(q.getStepNumber())
                .questionText(q.getQuestionText())
                .questionType(q.getQuestionType())
                .options(options.stream().map(o -> CaseDetailDto.OptionDto.builder()
                    .optionKey(o.getOptionKey())
                    .optionText(o.getOptionText())
                    .build()
                ).toList())
                .build();
        }).toList();

        return CaseDetailDto.builder()
            .caseId(c.getCaseId())
            .title(c.getTitle())
            .subtitle(c.getSubtitle())
            .difficulty(c.getDifficulty())
            .xpReward(c.getXpReward())
            .linkedAnatomyId(c.getLinkedAnatomy().getCanonicalId())
            .questions(questionDtos)
            .build();
    }

    @Transactional(readOnly = true)
    public Page<CaseSummaryDto> listCases(Pageable pageable) {
        return caseRepository.findAll(pageable).map(c -> CaseSummaryDto.builder()
            .caseId(c.getCaseId())
            .title(c.getTitle())
            .subtitle(c.getSubtitle())
            .difficulty(c.getDifficulty())
            .xpReward(c.getXpReward())
            .build()
        );
    }

    @Transactional(readOnly = true)
    public List<CaseSummaryDto> findByAnatomyPartId(UUID anatomyPartId) {
        return caseRepository.findByLinkedAnatomyId(anatomyPartId).stream()
            .map(c -> CaseSummaryDto.builder()
                .caseId(c.getCaseId())
                .title(c.getTitle())
                .subtitle(c.getSubtitle())
                .difficulty(c.getDifficulty())
                .xpReward(c.getXpReward())
                .build()
            ).toList();
    }
}
