package dev.traced.core.profile.controller;

import dev.traced.core.profile.dto.ProgressDto;
import dev.traced.core.profile.dto.UserProfileDto;
import dev.traced.core.profile.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getProfile(
        @RequestHeader("X-User-Id") UUID userId
    ) {
        return ResponseEntity.ok(profileService.getProfile(userId));
    }

    @GetMapping("/me/progress")
    public ResponseEntity<ProgressDto> getProgress(
        @RequestHeader("X-User-Id") UUID userId
    ) {
        return ResponseEntity.ok(profileService.getProgress(userId));
    }
}
