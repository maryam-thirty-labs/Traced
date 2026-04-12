package dev.traced.core.multiplayer.service;

import dev.traced.core.multiplayer.dto.GameRoomDto;
import dev.traced.core.multiplayer.dto.GameRoundDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Central point for all WebSocket broadcasts to room topics.
 * Every broadcast includes roomCode so clients can verify scope.
 * correctAnswer only appears in ROUND_COMPLETE events — never during active rounds.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RoomBroadcaster {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastParticipantsUpdate(GameRoomDto room) {
        send(room.roomCode(), Map.of(
            "event", "PARTICIPANTS_UPDATED",
            "roomCode", room.roomCode(),
            "participants", room.participants(),
            "status", room.status()
        ));
    }

    public void broadcastGameStarted(String roomCode, GameRoundDto firstRound) {
        send(roomCode, Map.of(
            "event", "GAME_STARTED",
            "roomCode", roomCode,
            "firstRound", firstRound
        ));
    }

    public void broadcastAnswerReceived(String roomCode, String participantId) {
        send(roomCode, Map.of(
            "event", "ANSWER_RECEIVED",
            "roomCode", roomCode,
            "participantId", participantId,
            "answeredAt", LocalDateTime.now().toString()
            // NOTE: no isCorrect, no answer value — would leak the answer mid-round
        ));
    }

    public void broadcastRoundComplete(
        String roomCode,
        int roundNumber,
        String correctAnswer,
        List<Map<String, Object>> scores
    ) {
        send(roomCode, Map.of(
            "event", "ROUND_COMPLETE",
            "roomCode", roomCode,
            "roundNumber", roundNumber,
            "correctAnswer", correctAnswer,
            "scores", scores
        ));
    }

    public void broadcastNextRound(String roomCode, GameRoundDto nextRound) {
        send(roomCode, Map.of(
            "event", "NEXT_ROUND",
            "roomCode", roomCode,
            "round", nextRound
        ));
    }

    public void broadcastGameCompleted(String roomCode, List<Map<String, Object>> finalRankings) {
        send(roomCode, Map.of(
            "event", "GAME_COMPLETED",
            "roomCode", roomCode,
            "finalRankings", finalRankings
        ));
    }

    public void broadcastRoomAbandoned(String roomCode) {
        send(roomCode, Map.of(
            "event", "ROOM_ABANDONED",
            "roomCode", roomCode
        ));
    }

    private void send(String roomCode, Map<String, Object> payload) {
        String destination = "/topic/room/" + roomCode;
        messagingTemplate.convertAndSend(destination, payload);
        log.debug("Broadcast to {}: {}", destination, payload.get("event"));
    }
}
