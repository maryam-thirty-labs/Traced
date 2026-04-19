package dev.traced.core.lesson.controller;

import dev.traced.core.lesson.dto.NextActionDto;
import dev.traced.core.lesson.service.LearningLoopService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/learning")
@RequiredArgsConstructor
public class LearningController {

    private final LearningLoopService learningLoopService;

    @GetMapping("/next-action")
    public ResponseEntity<NextActionDto> getNextAction(Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ResponseEntity.ok(learningLoopService.getNextAction(userId));
    }

    @PostMapping("/structures/{structureId}/explored")
    public ResponseEntity<Map<String, Object>> markExplored(
        Authentication auth,
        @PathVariable UUID structureId,
        @RequestBody(required = false) Map<String, String> body
    ) {
        UUID userId = (UUID) auth.getPrincipal();
        String source = body != null ? body.getOrDefault("source", "EXPLORER") : "EXPLORER";
        learningLoopService.markStructureExplored(userId, structureId, source);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of("status", "ok"));
    }
}
