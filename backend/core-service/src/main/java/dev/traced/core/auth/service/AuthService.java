package dev.traced.core.auth.service;

import dev.traced.core.auth.entity.User;
import dev.traced.core.auth.repository.UserRepository;
import dev.traced.core.profile.entity.UserProfile;
import dev.traced.core.profile.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public Map<String, Object> register(String email, String password, String displayName, String university) {
        if (userRepository.existsByEmail(email)) {
            throw new DataIntegrityViolationException("Email already registered");
        }

        User user = User.builder()
            .email(email)
            .password(passwordEncoder.encode(password))
            .displayName(displayName)
            .build();
        user = userRepository.save(user);

        // Create user profile
        UserProfile profile = UserProfile.builder()
            .userId(user.getId())
            .displayName(displayName)
            .university(university)
            .build();
        userProfileRepository.save(profile);

        String token = jwtService.generateToken(user.getId(), email);

        return Map.of(
            "token", token,
            "userId", user.getId().toString(),
            "displayName", displayName
        );
    }

    public Map<String, Object> login(String email, String password) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getId(), email);

        return Map.of(
            "token", token,
            "userId", user.getId().toString(),
            "displayName", user.getDisplayName()
        );
    }
}
