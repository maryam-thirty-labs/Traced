package dev.traced.core.cases.controller;

import dev.traced.core.cases.dto.CaseDetailDto;
import dev.traced.core.cases.dto.CaseSummaryDto;
import dev.traced.core.cases.service.CaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cases")
@RequiredArgsConstructor
public class CaseController {

    private final CaseService caseService;

    @GetMapping("/{caseId}")
    public ResponseEntity<CaseDetailDto> getCase(@PathVariable String caseId) {
        return ResponseEntity.ok(caseService.getCaseDetail(caseId));
    }

    @GetMapping
    public ResponseEntity<Page<CaseSummaryDto>> listCases(Pageable pageable) {
        return ResponseEntity.ok(caseService.listCases(pageable));
    }
}
