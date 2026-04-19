package dev.traced.core.progression.controller;

import dev.traced.core.progression.service.StreakService;
import dev.traced.core.progression.service.StreakService.StreakDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/progression")
@RequiredArgsConstructor
public class ProgressionController {

    private final StreakService streakService;

    @GetMapping("/streak")
    public ResponseEntity<StreakDto> getStreak(Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ResponseEntity.ok(streakService.getStreak(userId));
    }

    @PostMapping("/streak/freeze")
    public ResponseEntity<StreakDto> useFreeze(Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ResponseEntity.ok(streakService.useFreeze(userId));
    }
}
