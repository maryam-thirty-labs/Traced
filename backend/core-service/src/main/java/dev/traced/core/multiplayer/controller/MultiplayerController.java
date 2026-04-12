package dev.traced.core.multiplayer.controller;

import dev.traced.core.common.EntityNotFoundException;
import dev.traced.core.multiplayer.dto.GameRoomDto;
import dev.traced.core.multiplayer.service.GameRoomService;
import dev.traced.core.profile.entity.UserProfile;
import dev.traced.core.profile.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/multiplayer/rooms")
@RequiredArgsConstructor
public class MultiplayerController {

    private final GameRoomService roomService;
    private final UserProfileRepository userProfileRepository;

    private UUID resolveProfileId(Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        UserProfile p = userProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new EntityNotFoundException("UserProfile", userId.toString()));
        return p.getId();
    }

    @PostMapping
    public ResponseEntity<GameRoomDto> createRoom(
        Authentication auth,
        @RequestBody Map<String, String> body
    ) {
        UUID hostProfileId = resolveProfileId(auth);
        GameRoomDto room = roomService.createRoom(
            hostProfileId,
            body.getOrDefault("gameMode", "MYSTERY_DIAGNOSIS"),
            body.getOrDefault("difficulty", "EASY"),
            body.get("systemCanonicalId")
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(room);
    }

    @PostMapping("/{roomCode}/join")
    public ResponseEntity<GameRoomDto> joinRoom(
        Authentication auth,
        @PathVariable String roomCode
    ) {
        UUID profileId = resolveProfileId(auth);
        return ResponseEntity.ok(roomService.joinRoom(roomCode.toUpperCase(), profileId));
    }

    @PostMapping("/matchmaking")
    public ResponseEntity<GameRoomDto> matchmaking(
        Authentication auth,
        @RequestBody Map<String, String> body
    ) {
        UUID profileId = resolveProfileId(auth);
        GameRoomDto room = roomService.findOrCreateMatchmaking(
            profileId,
            body.getOrDefault("gameMode", "MYSTERY_DIAGNOSIS"),
            body.getOrDefault("difficulty", "EASY")
        );
        return ResponseEntity.ok(room);
    }

    @PostMapping("/{roomCode}/abandon")
    public ResponseEntity<Map<String, String>> abandon(
        Authentication auth,
        @PathVariable String roomCode
    ) {
        UUID profileId = resolveProfileId(auth);
        roomService.abandonRoom(roomCode.toUpperCase(), profileId);
        return ResponseEntity.ok(Map.of("roomCode", roomCode, "status", "ABANDONED"));
    }

    @GetMapping("/{roomCode}")
    public ResponseEntity<GameRoomDto> getRoom(@PathVariable String roomCode) {
        return ResponseEntity.ok(roomService.getRoom(roomCode.toUpperCase()));
    }
}
