package dev.traced.core.cases.service;

import dev.traced.core.cases.repository.CaseOptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CaseOptionService {

    private final CaseOptionRepository caseOptionRepository;

    public void validateCorrectness(UUID questionId) {
        long correctCount = caseOptionRepository.countByQuestionIdAndIsCorrectTrue(questionId);
        if (correctCount > 1) {
            throw new IllegalStateException(
                "Question " + questionId + " has " + correctCount
                    + " correct options — exactly one is required");
        }
    }
}
