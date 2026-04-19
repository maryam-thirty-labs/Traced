package dev.traced.core.notifications.controller;

import dev.traced.core.notifications.entity.UserPushSubscription;
import dev.traced.core.notifications.repository.UserPushSubscriptionRepository;
import dev.traced.core.profile.entity.UserProfile;
import dev.traced.core.profile.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationsController {

    private final UserPushSubscriptionRepository subscriptionRepository;
    private final UserProfileRepository userProfileRepository;

    /**
     * Store a PushSubscription JSON from navigator.serviceWorker.pushManager.
     * Idempotent on (userId, endpoint).
     */
    @PostMapping("/subscribe")
    @Transactional
    public ResponseEntity<Map<String, Object>> subscribe(
        Authentication auth,
        @RequestBody SubscribeRequest body
    ) {
        UUID userId = (UUID) auth.getPrincipal();
        subscriptionRepository.save(UserPushSubscription.builder()
            .userId(userId)
            .endpoint(body.endpoint())
            .p256dhKey(body.p256dhKey())
            .authKey(body.authKey())
            .userAgent(body.userAgent())
            .build());

        if (body.reminderTime() != null) {
            UserProfile profile = userProfileRepository.findByUserId(userId).orElse(null);
            if (profile != null) {
                profile.setReminderTime(body.reminderTime());
                profile.setNotificationsEnabled(true);
                userProfileRepository.save(profile);
            }
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("status", "subscribed"));
    }

    @PostMapping("/unsubscribe")
    @Transactional
    public ResponseEntity<Map<String, Object>> unsubscribe(
        Authentication auth,
        @RequestBody UnsubscribeRequest body
    ) {
        UUID userId = (UUID) auth.getPrincipal();
        subscriptionRepository.deleteByUserIdAndEndpoint(userId, body.endpoint());

        UserProfile profile = userProfileRepository.findByUserId(userId).orElse(null);
        if (profile != null && subscriptionRepository.findByUserId(userId).isEmpty()) {
            profile.setNotificationsEnabled(false);
            userProfileRepository.save(profile);
        }
        return ResponseEntity.ok(Map.of("status", "unsubscribed"));
    }

    public record SubscribeRequest(
        String endpoint,
        String p256dhKey,
        String authKey,
        String userAgent,
        String reminderTime
    ) {}

    public record UnsubscribeRequest(String endpoint) {}
}
