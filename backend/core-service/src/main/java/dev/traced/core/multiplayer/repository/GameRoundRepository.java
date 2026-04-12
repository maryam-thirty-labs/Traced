package dev.traced.core.multiplayer.repository;

import dev.traced.core.multiplayer.entity.GameRound;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GameRoundRepository extends JpaRepository<GameRound, UUID> {
    List<GameRound> findByRoomIdOrderByRoundNumberAsc(UUID roomId);
    Optional<GameRound> findByRoomIdAndRoundNumber(UUID roomId, Integer roundNumber);
    long countByRoomId(UUID roomId);
}
