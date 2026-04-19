package dev.traced.core.cases.controller;

import dev.traced.core.cases.dto.CaseDetailDto;
import dev.traced.core.cases.dto.CaseSummaryDto;
import dev.traced.core.cases.dto.WeeklyCaseResponseDto;
import dev.traced.core.cases.service.CaseService;
import dev.traced.core.cases.service.CaseSubmissionService;
import dev.traced.core.cases.service.CaseSubmissionService.AnswerDto;
import dev.traced.core.cases.service.CaseSubmissionService.SubmissionResult;
import dev.traced.core.cases.service.WeeklyCaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cases")
@RequiredArgsConstructor
public class CaseController {

    private final CaseService caseService;
    private final CaseSubmissionService caseSubmissionService;
    private final WeeklyCaseService weeklyCaseService;

    @GetMapping("/weekly")
    public ResponseEntity<WeeklyCaseResponseDto> getWeeklyCase(Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ResponseEntity.ok(weeklyCaseService.getCurrentWeekCase(userId));
    }

    @GetMapping("/{caseId}")
    public ResponseEntity<CaseDetailDto> getCase(@PathVariable String caseId) {
        return ResponseEntity.ok(caseService.getCaseDetail(caseId));
    }

    @GetMapping
    public ResponseEntity<Page<CaseSummaryDto>> listCases(Pageable pageable) {
        return ResponseEntity.ok(caseService.listCases(pageable));
    }

    @PostMapping("/{caseId}/submit")
    public ResponseEntity<SubmissionResult> submitCase(
        @PathVariable String caseId,
        @RequestBody SubmitRequest request
    ) {
        List<AnswerDto> answers = request.answers().stream()
            .map(a -> new AnswerDto(a.questionId(), a.selectedOptionKey()))
            .toList();
        SubmissionResult result = caseSubmissionService.submit(caseId, request.userProfileId(), answers);
        return ResponseEntity.ok(result);
    }

    public record SubmitRequest(
        UUID userProfileId,
        List<AnswerInput> answers
    ) {
        public record AnswerInput(String questionId, String selectedOptionKey) {}
    }
}
