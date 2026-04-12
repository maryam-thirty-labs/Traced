package dev.traced.core.multiplayer.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.traced.core.anatomy.entity.AnatomyPart;
import dev.traced.core.anatomy.repository.AnatomyPartRepository;
import dev.traced.core.common.EntityNotFoundException;
import dev.traced.core.multiplayer.dto.GameRoundDto;
import dev.traced.core.multiplayer.entity.GameRoom;
import dev.traced.core.multiplayer.entity.GameRound;
import dev.traced.core.multiplayer.repository.GameRoomRepository;
import dev.traced.core.multiplayer.repository.GameRoundRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class TraceSystemGameService {

    private final GameRoomRepository roomRepository;
    private final GameRoundRepository roundRepository;
    private final AnatomyPartRepository anatomyPartRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Random random = new Random();

    @Transactional
    public GameRoundDto generateRound(UUID roomId, String systemCanonicalId) {
        GameRoom room = roomRepository.findById(roomId)
            .orElseThrow(() -> new EntityNotFoundException("GameRoom", roomId.toString()));

        List<AnatomyPart> parts = anatomyPartRepository.findBySystemCanonicalId(systemCanonicalId);
        if (parts.size() < 3) {
            throw new IllegalArgumentException("Need at least 3 parts to trace a system");
        }

        // Correct sequence = parts in repository order (mirrors seed order)
        List<String> correctSequence = parts.stream()
            .map(AnatomyPart::getCanonicalId)
            .toList();

        // Shuffle for display
        List<Map<String, String>> shuffled = new ArrayList<>();
        List<AnatomyPart> shuffledParts = new ArrayList<>(parts);
        Collections.shuffle(shuffledParts, random);
        for (AnatomyPart p : shuffledParts) {
            shuffled.add(Map.of(
                "canonicalId", p.getCanonicalId(),
                "displayName", p.getDisplayName()
            ));
        }

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("system", systemCanonicalId);
        payload.put("shuffledOptions", shuffled);
        payload.put("expectedLength", correctSequence.size());

        String payloadJson;
        String correctJson;
        try {
            payloadJson = objectMapper.writeValueAsString(payload);
            correctJson = objectMapper.writeValueAsString(correctSequence);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialise round payload", e);
        }

        int nextRoundNumber = (int) roundRepository.countByRoomId(roomId) + 1;

        GameRound round = GameRound.builder()
            .room(room)
            .roundNumber(nextRoundNumber)
            .questionPayload(payloadJson)
            .correctAnswer(correctJson)
            .build();
        round = roundRepository.save(round);

        return GameRoundDto.builder()
            .roundId(round.getId().toString())
            .roundNumber(round.getRoundNumber())
            .questionPayload(payloadJson)
            .startedAt(round.getStartedAt())
            .build();
    }

    /** Evaluates positional sequence match. Returns correct positions count + total. */
    public EvaluationResult evaluate(UUID roundId, List<String> submittedSequence) {
        GameRound round = roundRepository.findById(roundId)
            .orElseThrow(() -> new EntityNotFoundException("GameRound", roundId.toString()));

        List<String> correctSequence;
        try {
            correctSequence = objectMapper.readValue(round.getCorrectAnswer(), new TypeReference<>() {});
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse correct sequence", e);
        }

        int correctPositions = 0;
        int total = correctSequence.size();
        if (submittedSequence != null) {
            int minLen = Math.min(submittedSequence.size(), total);
            for (int i = 0; i < minLen; i++) {
                if (submittedSequence.get(i).equals(correctSequence.get(i))) {
                    correctPositions++;
                }
            }
        }

        boolean isFullyCorrect = correctPositions == total && submittedSequence != null && submittedSequence.size() == total;
        return new EvaluationResult(isFullyCorrect, correctPositions, total);
    }

    public record EvaluationResult(boolean isFullyCorrect, int correctPositions, int total) {
        public int pointsAwarded() {
            if (isFullyCorrect) return 100;
            return correctPositions * 10;
        }
    }
}
