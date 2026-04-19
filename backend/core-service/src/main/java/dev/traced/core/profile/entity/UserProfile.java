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

    @Column(name = "university")
    private String university;

    @Column(name = "learning_activated", nullable = false)
    @Builder.Default
    private Boolean learningActivated = false;

    @Column(name = "current_system_id")
    private UUID currentSystemId;

    @Column(name = "streak_freeze_available", nullable = false)
    @Builder.Default
    private Boolean streakFreezeAvailable = true;

    @Column(name = "streak_freeze_used_week")
    private Integer streakFreezeUsedWeek;

    @Column(name = "reminder_time", length = 8)
    private String reminderTime;

    @Column(name = "notifications_enabled", nullable = false)
    @Builder.Default
    private Boolean notificationsEnabled = false;

    /**
     * Audience/voice profile for AdaptiveExplainer.
     * Values: curious_adult | med_student | fitness | health_scare.
     * DB-level CHECK constraint is authoritative; keep the Java side aligned.
     */
    @Column(name = "background", nullable = false, length = 20)
    @Builder.Default
    private String background = "curious_adult";

    // No currentLevel column — derived by LevelService, never persisted
}
