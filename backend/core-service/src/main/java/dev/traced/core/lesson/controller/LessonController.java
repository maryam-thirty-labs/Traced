package dev.traced.core.lesson.controller;

import dev.traced.core.lesson.dto.LessonCompletionDto;
import dev.traced.core.lesson.dto.LessonDto;
import dev.traced.core.lesson.service.LearningLoopService;
import dev.traced.core.lesson.service.LearningLoopService.RetrievalAnswer;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/lessons")
@RequiredArgsConstructor
public class LessonController {

    private final LearningLoopService learningLoopService;

    @GetMapping("/today")
    public ResponseEntity<LessonDto> getTodayLesson(Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ResponseEntity.ok(learningLoopService.getTodayLesson(userId));
    }

    @PostMapping("/today/complete")
    public ResponseEntity<LessonCompletionDto> completeTodayLesson(
        Authentication auth,
        @RequestBody CompleteRequest body
    ) {
        UUID userId = (UUID) auth.getPrincipal();
        List<RetrievalAnswer> answers = body.retrievalAnswers() == null
            ? List.of()
            : body.retrievalAnswers().stream()
                .map(r -> new RetrievalAnswer(r.structureId(), r.correct()))
                .toList();
        return ResponseEntity.ok(learningLoopService.completeTodayLesson(userId, answers));
    }

    public record CompleteRequest(List<RetrievalAnswerRequest> retrievalAnswers) {}

    public record RetrievalAnswerRequest(UUID structureId, boolean correct) {}
}
