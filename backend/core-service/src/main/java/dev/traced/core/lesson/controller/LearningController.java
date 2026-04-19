package dev.traced.core.lesson.controller;

import dev.traced.core.anatomy.entity.AnatomyPart;
import dev.traced.core.anatomy.repository.AnatomyPartRepository;
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
    private final AnatomyPartRepository anatomyPartRepository;

    @GetMapping("/next-action")
    public ResponseEntity<NextActionDto> getNextAction(Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ResponseEntity.ok(learningLoopService.getNextAction(userId));
    }

    @PostMapping("/structures/{structureId}/explored")
    public ResponseEntity<Map<String, Object>> markExplored(
        Authentication auth,
        @PathVariable String structureId,
        @RequestBody(required = false) Map<String, String> body
    ) {
        UUID userId = (UUID) auth.getPrincipal();
        String source = body != null ? body.getOrDefault("source", "EXPLORER") : "EXPLORER";

        UUID resolved = resolveStructureId(structureId);
        learningLoopService.markStructureExplored(userId, resolved, source);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of("status", "ok"));
    }

    /** Accepts either a UUID or an anatomy canonical ID like "ANAT_HEART_001". */
    private UUID resolveStructureId(String id) {
        try {
            return UUID.fromString(id);
        } catch (IllegalArgumentException notUuid) {
            AnatomyPart part = anatomyPartRepository.findByCanonicalId(id)
                .orElseThrow(() -> new IllegalArgumentException("Unknown structure: " + id));
            return part.getId();
        }
    }
}
