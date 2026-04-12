package dev.traced.core.multiplayer.service;

import dev.traced.core.common.EntityNotFoundException;
import dev.traced.core.leaderboard.service.WeeklyXpSnapshotService;
import dev.traced.core.multiplayer.entity.GameParticipant;
import dev.traced.core.multiplayer.entity.GameRoom;
import dev.traced.core.multiplayer.repository.GameParticipantRepository;
import dev.traced.core.multiplayer.repository.GameRoomRepository;
import dev.traced.core.profile.entity.UserProfile;
import dev.traced.core.profile.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class EndGameService {

    public static final Map<Integer, Integer> RANK_XP = Map.of(
        1, 50,
        2, 30,
        3, 15,
        4, 5
    );
    public static final int PARTICIPATION_XP_FLOOR = 5;

    private final GameRoomRepository roomRepository;
    private final GameParticipantRepository participantRepository;
    private final UserProfileRepository userProfileRepository;
    private final RoomBroadcaster broadcaster;
    private final WeeklyXpSnapshotService weeklyXpSnapshotService;

    @Transactional
    public List<Map<String, Object>> completeGame(UUID roomId) {
        GameRoom room = roomRepository.findById(roomId)
            .orElseThrow(() -> new EntityNotFoundException("GameRoom", roomId.toString()));

        List<GameParticipant> participants = participantRepository.findByRoomId(roomId);

        // Sort descending by score — ties broken by earliest join
        List<GameParticipant> ranked = new ArrayList<>(participants);
        ranked.sort(Comparator
            .comparingInt(GameParticipant::getScore).reversed()
            .thenComparing(GameParticipant::getJoinedAt));

        List<Map<String, Object>> rankings = new ArrayList<>();
        for (int i = 0; i < ranked.size(); i++) {
            GameParticipant p = ranked.get(i);
            int rank = i + 1;
            int xp = RANK_XP.getOrDefault(rank, PARTICIPATION_XP_FLOOR);

            p.setRank(rank);
            participantRepository.save(p);

            UserProfile profile = p.getUserProfile();
            profile.setTotalXp(profile.getTotalXp() + xp);
            userProfileRepository.save(profile);

            // Update weekly XP snapshot
            weeklyXpSnapshotService.generateForCurrentWeek(profile);

            rankings.add(Map.of(
                "participantId", p.getId().toString(),
                "displayName", profile.getDisplayName(),
                "rank", rank,
                "score", p.getScore(),
                "xpAwarded", xp
            ));
        }

        room.setStatus("COMPLETED");
        room.setCompletedAt(LocalDateTime.now());
        roomRepository.save(room);

        broadcaster.broadcastGameCompleted(room.getRoomCode(), rankings);
        return rankings;
    }
}
