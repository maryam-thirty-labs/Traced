package dev.traced.core.cases.service;

import dev.traced.core.cases.entity.Case;
import dev.traced.core.cases.entity.CaseAttempt;
import dev.traced.core.cases.entity.CaseOption;
import dev.traced.core.cases.entity.CaseQuestion;
import dev.traced.core.cases.repository.CaseAttemptRepository;
import dev.traced.core.cases.repository.CaseOptionRepository;
import dev.traced.core.cases.repository.CaseQuestionRepository;
import dev.traced.core.common.EntityNotFoundException;
import dev.traced.core.profile.entity.UserProfile;
import dev.traced.core.profile.repository.UserProfileRepository;
import dev.traced.core.progression.service.LevelService;
import dev.traced.core.progression.service.MasteryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CaseSubmissionService {

    private final CaseService caseService;
    private final CaseQuestionRepository caseQuestionRepository;
    private final CaseOptionRepository caseOptionRepository;
    private final CaseAttemptRepository caseAttemptRepository;
    private final UserProfileRepository userProfileRepository;
    private final LevelService levelService;
    private final MasteryService masteryService;

    @Transactional
    public SubmissionResult submit(String caseId, UUID userProfileId, List<AnswerDto> answers) {
        Case c = caseService.findByCaseId(caseId);
        UserProfile profile = userProfileRepository.findById(userProfileId)
            .orElseThrow(() -> new EntityNotFoundException("UserProfile", userProfileId.toString()));

        List<CaseQuestion> questions = caseQuestionRepository.findByLinkedCaseIdOrderByStepNumber(c.getId());

        if (answers.size() != questions.size()) {
            throw new IllegalArgumentException("All questions must be answered");
        }

        Map<String, String> answerMap = new java.util.HashMap<>();
        for (AnswerDto a : answers) {
            answerMap.put(a.questionId(), a.selectedOptionKey());
        }

        int correct = 0;
        for (CaseQuestion q : questions) {
            String selectedKey = answerMap.get(q.getId().toString());
            if (selectedKey == null) {
                throw new IllegalArgumentException("Missing answer for question " + q.getId());
            }

            List<CaseOption> options = caseOptionRepository.findByQuestionId(q.getId());
            boolean isCorrect = options.stream()
                .anyMatch(o -> o.getOptionKey().equals(selectedKey) && o.getIsCorrect());

            if (isCorrect) {
                correct++;
            }
        }

        int total = questions.size();
        int score = Math.round((float) correct / total * 100);
        String outcome = score == 100 ? "CORRECT" : "INCORRECT";
        int xpAwarded = outcome.equals("CORRECT") ? c.getXpReward() : 0;

        // Update totalXp
        profile.setTotalXp(profile.getTotalXp() + xpAwarded);
        userProfileRepository.save(profile);

        // Write CaseAttempt — same transaction
        CaseAttempt attempt = CaseAttempt.builder()
            .userProfile(profile)
            .linkedCase(c)
            .completedAt(LocalDateTime.now())
            .outcome(outcome)
            .xpAwarded(xpAwarded)
            .score(score)
            .build();
        caseAttemptRepository.save(attempt);

        // Update mastery — same transaction
        String systemCanonicalId = c.getLinkedAnatomy().getSystem().getCanonicalId();
        masteryService.update(userProfileId, systemCanonicalId, outcome.equals("CORRECT"), profile);

        int currentLevel = levelService.calculateLevel(profile.getTotalXp());

        return new SubmissionResult(
            outcome,
            score,
            xpAwarded,
            currentLevel,
            profile.getTotalXp(),
            correct,
            total
        );
    }

    public record AnswerDto(String questionId, String selectedOptionKey) {}

    public record SubmissionResult(
        String outcome,
        int score,
        int xpAwarded,
        int currentLevel,
        int totalXp,
        int correctCount,
        int totalQuestions
    ) {}
}
