package dev.traced.core.notifications.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_push_subscriptions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "endpoint"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPushSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String endpoint;

    @Column(name = "p256dh_key", nullable = false, columnDefinition = "TEXT")
    private String p256dhKey;

    @Column(name = "auth_key", nullable = false, columnDefinition = "TEXT")
    private String authKey;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
