package dev.traced.core.multiplayer.service;

import dev.traced.core.common.EntityNotFoundException;
import dev.traced.core.multiplayer.dto.GameRoomDto;
import dev.traced.core.multiplayer.dto.ParticipantDto;
import dev.traced.core.multiplayer.entity.GameParticipant;
import dev.traced.core.multiplayer.entity.GameRoom;
import dev.traced.core.multiplayer.repository.GameParticipantRepository;
import dev.traced.core.multiplayer.repository.GameRoomRepository;
import dev.traced.core.profile.entity.UserProfile;
import dev.traced.core.profile.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GameRoomService {

    public static final int MAX_PARTICIPANTS = 4;
    public static final Set<String> GAME_MODES = Set.of(
        "NAME_STRUCTURE", "TRACE_SYSTEM", "MYSTERY_DIAGNOSIS"
    );
    public static final Set<String> DIFFICULTIES = Set.of("EASY", "MEDIUM", "HARD");

    private final GameRoomRepository roomRepository;
    private final GameParticipantRepository participantRepository;
    private final UserProfileRepository userProfileRepository;
    private final RoomCodeGenerator codeGenerator;

    @Transactional
    public GameRoomDto createRoom(UUID hostProfileId, String gameMode, String difficulty, String systemCanonicalId) {
        if (!GAME_MODES.contains(gameMode)) {
            throw new IllegalArgumentException("Unknown gameMode: " + gameMode);
        }
        if (!DIFFICULTIES.contains(difficulty)) {
            throw new IllegalArgumentException("Unknown difficulty: " + difficulty);
        }

        UserProfile host = userProfileRepository.findById(hostProfileId)
            .orElseThrow(() -> new EntityNotFoundException("UserProfile", hostProfileId.toString()));

        GameRoom room = GameRoom.builder()
            .roomCode(codeGenerator.generateUnique())
            .hostProfile(host)
            .status("WAITING")
            .gameMode(gameMode)
            .difficulty(difficulty)
            .systemCanonicalId(systemCanonicalId)
            .build();
        room = roomRepository.save(room);

        // Host auto-joins
        GameParticipant hostParticipant = GameParticipant.builder()
            .room(room)
            .userProfile(host)
            .score(0)
            .build();
        participantRepository.save(hostParticipant);

        return toDto(room);
    }

    @Transactional
    public GameRoomDto joinRoom(String roomCode, UUID userProfileId) {
        GameRoom room = roomRepository.findByRoomCode(roomCode)
            .orElseThrow(() -> new EntityNotFoundException("GameRoom", roomCode));

        if (!"WAITING".equals(room.getStatus())) {
            throw new IllegalArgumentException("Room is not accepting players (status: " + room.getStatus() + ")");
        }

        if (participantRepository.countByRoomId(room.getId()) >= MAX_PARTICIPANTS) {
            throw new DataIntegrityViolationException("Room is full");
        }

        if (participantRepository.existsByRoomIdAndUserProfileId(room.getId(), userProfileId)) {
            // Already joined — idempotent
            return toDto(room);
        }

        UserProfile profile = userProfileRepository.findById(userProfileId)
            .orElseThrow(() -> new EntityNotFoundException("UserProfile", userProfileId.toString()));

        GameParticipant participant = GameParticipant.builder()
            .room(room)
            .userProfile(profile)
            .score(0)
            .build();
        participantRepository.save(participant);

        return toDto(room);
    }

    @Transactional
    public void abandonRoom(String roomCode, UUID hostProfileId) {
        GameRoom room = roomRepository.findByRoomCode(roomCode)
            .orElseThrow(() -> new EntityNotFoundException("GameRoom", roomCode));
        if (!room.getHostProfile().getId().equals(hostProfileId)) {
            throw new IllegalArgumentException("Only the host can abandon the room");
        }
        if (!"WAITING".equals(room.getStatus())) {
            throw new IllegalArgumentException("Only WAITING rooms can be abandoned");
        }
        room.setStatus("ABANDONED");
        roomRepository.save(room);
    }

    @Transactional
    public GameRoomDto findOrCreateMatchmaking(UUID userProfileId, String gameMode, String difficulty) {
        // Find an existing WAITING room matching mode + difficulty with capacity
        List<GameRoom> candidates = roomRepository.findByStatusAndGameModeAndDifficulty("WAITING", gameMode, difficulty);
        for (GameRoom candidate : candidates) {
            if (participantRepository.countByRoomId(candidate.getId()) < MAX_PARTICIPANTS
                && !participantRepository.existsByRoomIdAndUserProfileId(candidate.getId(), userProfileId)) {
                return joinRoom(candidate.getRoomCode(), userProfileId);
            }
        }
        // Otherwise create a new room as host
        return createRoom(userProfileId, gameMode, difficulty, null);
    }

    public GameRoomDto getRoom(String roomCode) {
        GameRoom room = roomRepository.findByRoomCode(roomCode)
            .orElseThrow(() -> new EntityNotFoundException("GameRoom", roomCode));
        return toDto(room);
    }

    public GameRoomDto toDto(GameRoom room) {
        List<GameParticipant> participants = participantRepository.findByRoomId(room.getId());
        return GameRoomDto.builder()
            .roomCode(room.getRoomCode())
            .status(room.getStatus())
            .gameMode(room.getGameMode())
            .difficulty(room.getDifficulty())
            .systemCanonicalId(room.getSystemCanonicalId())
            .hostProfileId(room.getHostProfile().getId().toString())
            .participants(participants.stream().map(p -> ParticipantDto.builder()
                .participantId(p.getId().toString())
                .userProfileId(p.getUserProfile().getId().toString())
                .displayName(p.getUserProfile().getDisplayName())
                .score(p.getScore())
                .rank(p.getRank())
                .build()
            ).toList())
            .build();
    }
}
