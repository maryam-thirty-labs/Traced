package dev.traced.core.multiplayer.entity;

import dev.traced.core.profile.entity.UserProfile;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "game_rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GameRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "room_code", nullable = false, unique = true, length = 6)
    private String roomCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_profile_id", nullable = false)
    private UserProfile hostProfile;

    @Column(nullable = false)
    @Builder.Default
    private String status = "WAITING";

    @Column(name = "game_mode", nullable = false)
    private String gameMode;

    @Column(nullable = false)
    private String difficulty;

    @Column(name = "system_canonical_id")
    private String systemCanonicalId;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}
