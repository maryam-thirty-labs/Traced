package dev.traced.core.cases.repository;

import dev.traced.core.cases.entity.CaseQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CaseQuestionRepository extends JpaRepository<CaseQuestion, UUID> {
    List<CaseQuestion> findByLinkedCaseIdOrderByStepNumber(UUID caseId);
}
