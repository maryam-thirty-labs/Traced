package dev.traced.core.profile.controller;

import dev.traced.core.profile.dto.PreferencesRequest;
import dev.traced.core.profile.dto.ProgressDto;
import dev.traced.core.profile.dto.UserProfileDto;
import dev.traced.core.profile.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getProfile(Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ResponseEntity.ok(profileService.getProfile(userId));
    }

    @GetMapping("/me/progress")
    public ResponseEntity<ProgressDto> getProgress(Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ResponseEntity.ok(profileService.getProgress(userId));
    }

    @PatchMapping("/me/preferences")
    public ResponseEntity<Map<String, String>> updatePreferences(
        Authentication auth,
        @RequestBody PreferencesRequest request
    ) {
        UUID userId = (UUID) auth.getPrincipal();
        profileService.updatePreferences(userId, request);
        return ResponseEntity.ok(Map.of("status", "updated"));
    }

    @DeleteMapping("/me/progress")
    public ResponseEntity<Map<String, String>> resetProgress(
        Authentication auth,
        @RequestBody Map<String, String> body
    ) {
        String phrase = body.get("confirmationPhrase");
        if (!"RESET_MY_PROGRESS".equals(phrase)) {
            throw new IllegalArgumentException("Invalid confirmation phrase");
        }
        UUID userId = (UUID) auth.getPrincipal();
        profileService.resetProgress(userId);
        return ResponseEntity.ok(Map.of("status", "reset"));
    }
}
