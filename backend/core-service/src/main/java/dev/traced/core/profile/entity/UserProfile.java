package dev.traced.core.profile.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column(name = "joined_at", nullable = false)
    @Builder.Default
    private LocalDateTime joinedAt = LocalDateTime.now();

    @Column(name = "preferred_system")
    private String preferredSystem;

    @Column(name = "etymology_enabled", nullable = false)
    @Builder.Default
    private Boolean etymologyEnabled = true;

    @Column(name = "total_xp", nullable = false)
    @Builder.Default
    private Integer totalXp = 0;

    @Column(name = "current_streak", nullable = false)
    @Builder.Default
    private Integer currentStreak = 0;

    @Column(name = "last_active_date")
    private LocalDate lastActiveDate;

    // No currentLevel column — derived by LevelService, never persisted
}
