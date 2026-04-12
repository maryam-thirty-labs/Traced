package dev.traced.core.multiplayer.service;

import dev.traced.core.multiplayer.repository.GameRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
@RequiredArgsConstructor
public class RoomCodeGenerator {

    // Exclude ambiguous characters: 0/O, 1/I, to make codes easier to share verbally
    private static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int CODE_LENGTH = 6;
    private static final int MAX_ATTEMPTS = 50;

    private final SecureRandom random = new SecureRandom();
    private final GameRoomRepository roomRepository;

    public String generateUnique() {
        for (int i = 0; i < MAX_ATTEMPTS; i++) {
            String code = randomCode();
            if (!roomRepository.existsByRoomCode(code)) {
                return code;
            }
        }
        throw new IllegalStateException("Could not generate unique room code after " + MAX_ATTEMPTS + " attempts");
    }

    String randomCode() {
        StringBuilder sb = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            sb.append(ALPHABET.charAt(random.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }
}
