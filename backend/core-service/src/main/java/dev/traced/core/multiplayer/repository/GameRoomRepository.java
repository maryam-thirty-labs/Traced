package dev.traced.core.multiplayer.repository;

import dev.traced.core.multiplayer.entity.GameRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GameRoomRepository extends JpaRepository<GameRoom, UUID> {
    Optional<GameRoom> findByRoomCode(String roomCode);
    boolean existsByRoomCode(String roomCode);
    List<GameRoom> findByStatusAndGameModeAndDifficulty(String status, String gameMode, String difficulty);
}
