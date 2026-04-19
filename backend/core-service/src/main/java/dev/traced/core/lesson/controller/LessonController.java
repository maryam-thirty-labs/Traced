package dev.traced.core.lesson.controller;

import dev.traced.core.lesson.dto.LessonDto;
import dev.traced.core.lesson.service.LearningLoopService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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
        LessonDto dto = learningLoopService.getTodayLesson(userId).orElseGet(() ->
            // Sprint 8 will generate a fresh lesson here. For Sprint 7 we return
            // a minimal shell so the frontend contract holds.
            LessonDto.builder()
                .lessonId(null)
                .lessonDate(LocalDate.now().toString())
                .completed(false)
                .retrieval(List.of())
                .explore(null)
                .expectedXp(0)
                .build());
        return ResponseEntity.ok(dto);
    }
}
