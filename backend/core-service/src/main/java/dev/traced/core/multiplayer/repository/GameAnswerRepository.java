package dev.traced.core.multiplayer.repository;

import dev.traced.core.multiplayer.entity.GameAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GameAnswerRepository extends JpaRepository<GameAnswer, UUID> {
    List<GameAnswer> findByRoundId(UUID roundId);
    boolean existsByRoundIdAndParticipantId(UUID roundId, UUID participantId);
    long countByRoundId(UUID roundId);
}
