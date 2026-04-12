package dev.traced.core.multiplayer.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.traced.core.anatomy.entity.AnatomyPart;
import dev.traced.core.anatomy.entity.AnatomySynonym;
import dev.traced.core.anatomy.repository.AnatomyPartRepository;
import dev.traced.core.anatomy.repository.AnatomySynonymRepository;
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
public class NameStructureGameService {

    private final GameRoomRepository roomRepository;
    private final GameRoundRepository roundRepository;
    private final AnatomyPartRepository anatomyPartRepository;
    private final AnatomySynonymRepository synonymRepository;
    private final StringMatcher stringMatcher;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Random random = new Random();

    @Transactional
    public GameRoundDto generateRound(UUID roomId, String systemCanonicalId) {
        GameRoom room = roomRepository.findById(roomId)
            .orElseThrow(() -> new EntityNotFoundException("GameRoom", roomId.toString()));

        List<AnatomyPart> parts = anatomyPartRepository.findBySystemCanonicalId(systemCanonicalId);
        if (parts.isEmpty()) {
            throw new IllegalArgumentException("No anatomy parts for system: " + systemCanonicalId);
        }
        AnatomyPart picked = parts.get(random.nextInt(parts.size()));

        // Payload sent to client — no name included (that's the question)
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("canonicalId", picked.getCanonicalId());
        payload.put("regionHint", picked.getRegion());
        payload.put("system", systemCanonicalId);

        String payloadJson;
        try {
            payloadJson = objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialise round payload", e);
        }

        int nextRoundNumber = (int) roundRepository.countByRoomId(roomId) + 1;

        GameRound round = GameRound.builder()
            .room(room)
            .roundNumber(nextRoundNumber)
            .questionPayload(payloadJson)
            .correctAnswer(picked.getDisplayName())
            .build();
        round = roundRepository.save(round);

        return GameRoundDto.builder()
            .roundId(round.getId().toString())
            .roundNumber(round.getRoundNumber())
            .questionPayload(payloadJson)
            .startedAt(round.getStartedAt())
            .build();
    }

    /** Pure evaluation: does this answer match the round's correct answer (or synonyms)? */
    public boolean evaluate(UUID roundId, String answerValue) {
        GameRound round = roundRepository.findById(roundId)
            .orElseThrow(() -> new EntityNotFoundException("GameRound", roundId.toString()));

        // Decode canonical ID from payload to fetch synonyms
        String canonicalId;
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> payload = objectMapper.readValue(round.getQuestionPayload(), Map.class);
            canonicalId = (String) payload.get("canonicalId");
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse round payload", e);
        }

        AnatomyPart part = anatomyPartRepository.findByCanonicalId(canonicalId)
            .orElseThrow(() -> new EntityNotFoundException("AnatomyPart", canonicalId));

        List<String> acceptedAnswers = new ArrayList<>();
        acceptedAnswers.add(part.getDisplayName());
        List<AnatomySynonym> synonyms = synonymRepository.findByAnatomyPartId(part.getId());
        synonyms.forEach(s -> acceptedAnswers.add(s.getSynonym()));

        return stringMatcher.matches(answerValue, acceptedAnswers);
    }
}
