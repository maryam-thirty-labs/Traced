package dev.traced.core.multiplayer.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.traced.core.cases.entity.Case;
import dev.traced.core.cases.entity.CaseVignette;
import dev.traced.core.cases.repository.CaseRepository;
import dev.traced.core.cases.repository.CaseVignetteRepository;
import dev.traced.core.common.EntityNotFoundException;
import dev.traced.core.disease.entity.Disease;
import dev.traced.core.disease.repository.DiseaseRepository;
import dev.traced.core.multiplayer.dto.GameRoundDto;
import dev.traced.core.multiplayer.entity.GameRoom;
import dev.traced.core.multiplayer.entity.GameRound;
import dev.traced.core.multiplayer.repository.GameRoomRepository;
import dev.traced.core.multiplayer.repository.GameRoundRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class MysteryDiagnosisGameService {

    private final GameRoomRepository roomRepository;
    private final GameRoundRepository roundRepository;
    private final CaseRepository caseRepository;
    private final CaseVignetteRepository caseVignetteRepository;
    private final DiseaseRepository diseaseRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Random random = new Random();

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public GameRoundDto generateRound(UUID roomId, String difficulty) {
        GameRoom room = roomRepository.findById(roomId)
            .orElseThrow(() -> new EntityNotFoundException("GameRoom", roomId.toString()));

        List<Case> cases = em.createQuery(
            "SELECT c FROM Case c JOIN FETCH c.linkedDisease WHERE UPPER(c.difficulty) = :difficulty AND c.status = 'ACTIVE'",
            Case.class
        ).setParameter("difficulty", difficulty.toUpperCase()).getResultList();

        if (cases.isEmpty()) {
            throw new IllegalArgumentException("No cases found for difficulty: " + difficulty);
        }

        Case picked = cases.get(random.nextInt(cases.size()));
        Disease correctDisease = picked.getLinkedDisease();

        // Distractors: real disease names from the same category
        List<Disease> pool = diseaseRepository.findAll().stream()
            .filter(d -> !d.getId().equals(correctDisease.getId()))
            .filter(d -> d.getCategory() != null
                && d.getCategory().equalsIgnoreCase(correctDisease.getCategory()))
            .toList();

        List<Disease> distractors = new ArrayList<>(pool);
        Collections.shuffle(distractors, random);
        distractors = distractors.size() > 3 ? distractors.subList(0, 3) : distractors;

        // Build options A-D, shuffled
        List<Map<String, String>> options = new ArrayList<>();
        options.add(Map.of("diseaseId", correctDisease.getCanonicalId(), "diseaseName", correctDisease.getName()));
        for (Disease d : distractors) {
            options.add(Map.of("diseaseId", d.getCanonicalId(), "diseaseName", d.getName()));
        }
        Collections.shuffle(options, random);

        // Assign letter keys
        List<Map<String, String>> optionsWithKeys = new ArrayList<>();
        String[] keys = {"A", "B", "C", "D"};
        String correctKey = null;
        for (int i = 0; i < options.size(); i++) {
            Map<String, String> opt = new LinkedHashMap<>();
            opt.put("optionKey", keys[i]);
            opt.put("diseaseName", options.get(i).get("diseaseName"));
            optionsWithKeys.add(opt);
            if (correctDisease.getCanonicalId().equals(options.get(i).get("diseaseId"))) {
                correctKey = keys[i];
            }
        }

        // Payload: vignette + options, NO case title (mystery preserved), NO correct key
        CaseVignette vignette = caseVignetteRepository.findByLinkedCaseId(picked.getId()).orElse(null);
        Map<String, Object> payload = new LinkedHashMap<>();
        if (vignette != null) {
            payload.put("presentingComplaint", vignette.getPresentingComplaint());
            payload.put("fullVignetteText", vignette.getFullVignetteText());
            payload.put("patientAge", vignette.getPatientAge());
            payload.put("patientSex", vignette.getPatientSex());
        } else {
            payload.put("presentingComplaint", picked.getSubtitle());
            payload.put("fullVignetteText", picked.getSubtitle());
        }
        payload.put("options", optionsWithKeys);
        payload.put("difficulty", difficulty.toUpperCase());
        // case title intentionally omitted — would reveal the answer

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
            .correctAnswer(correctKey)
            .build();
        round = roundRepository.save(round);

        return GameRoundDto.builder()
            .roundId(round.getId().toString())
            .roundNumber(round.getRoundNumber())
            .questionPayload(payloadJson)
            .startedAt(round.getStartedAt())
            .build();
    }

    public boolean evaluate(UUID roundId, String selectedOptionKey) {
        GameRound round = roundRepository.findById(roundId)
            .orElseThrow(() -> new EntityNotFoundException("GameRound", roundId.toString()));
        return round.getCorrectAnswer().equalsIgnoreCase(selectedOptionKey);
    }
}
