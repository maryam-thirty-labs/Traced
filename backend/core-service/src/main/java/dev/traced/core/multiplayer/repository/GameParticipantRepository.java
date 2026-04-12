package dev.traced.core.multiplayer.repository;

import dev.traced.core.multiplayer.entity.GameParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface GameParticipantRepository extends JpaRepository<GameParticipant, UUID> {

    @Query("SELECT p FROM GameParticipant p JOIN FETCH p.userProfile WHERE p.room.id = :roomId ORDER BY p.joinedAt ASC")
    List<GameParticipant> findByRoomId(UUID roomId);

    long countByRoomId(UUID roomId);

    boolean existsByRoomIdAndUserProfileId(UUID roomId, UUID userProfileId);
}
