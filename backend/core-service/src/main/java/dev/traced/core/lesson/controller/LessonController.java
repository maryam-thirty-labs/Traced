package dev.traced.core.lesson.controller;

import dev.traced.core.lesson.dto.LessonDto;
import dev.traced.core.lesson.service.LearningLoopService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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
}
