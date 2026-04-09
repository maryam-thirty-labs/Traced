package dev.traced.core.cases.repository;

import dev.traced.core.cases.entity.CaseOption;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CaseOptionRepository extends JpaRepository<CaseOption, UUID> {
    List<CaseOption> findByQuestionId(UUID questionId);
    long countByQuestionIdAndIsCorrectTrue(UUID questionId);
}
