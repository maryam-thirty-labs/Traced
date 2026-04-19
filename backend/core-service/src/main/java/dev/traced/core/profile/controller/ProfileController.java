package dev.traced.core.profile.controller;

import dev.traced.core.common.EntityNotFoundException;
import dev.traced.core.leaderboard.service.FriendsService;
import dev.traced.core.profile.dto.PreferencesRequest;
import dev.traced.core.profile.dto.ProgressDto;
import dev.traced.core.profile.dto.UserProfileDto;
import dev.traced.core.profile.entity.UserProfile;
import dev.traced.core.profile.repository.UserProfileRepository;
import dev.traced.core.profile.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final FriendsService friendsService;
    private final UserProfileRepository userProfileRepository;

    private UUID toProfileId(Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        UserProfile p = userProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new EntityNotFoundException("UserProfile", userId.toString()));
        return p.getId();
    }

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
        @jakarta.validation.Valid @RequestBody PreferencesRequest request
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

    @GetMapping("/me/friends")
    public ResponseEntity<List<Map<String, Object>>> listFriends(Authentication auth) {
        UUID myProfileId = toProfileId(auth);
        List<Map<String, Object>> out = friendsService.listFriends(myProfileId).stream()
            .map(p -> Map.<String, Object>of(
                "friendProfileId", p.getId().toString(),
                "displayName", p.getDisplayName()
            ))
            .toList();
        return ResponseEntity.ok(out);
    }

    @PostMapping("/me/friends")
    public ResponseEntity<Map<String, String>> addFriend(
        Authentication auth,
        @RequestBody Map<String, String> body
    ) {
        UUID myProfileId = toProfileId(auth);
        UUID friendId = friendsService.addFriendByDisplayName(myProfileId, body.get("displayName"));
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "friendProfileId", friendId.toString(),
            "status", "added"
        ));
    }

    @DeleteMapping("/me/friends/{friendId}")
    public ResponseEntity<Map<String, String>> removeFriend(
        Authentication auth,
        @PathVariable UUID friendId
    ) {
        UUID myProfileId = toProfileId(auth);
        friendsService.removeFriend(myProfileId, friendId);
        return ResponseEntity.ok(Map.of("status", "removed"));
    }
}
