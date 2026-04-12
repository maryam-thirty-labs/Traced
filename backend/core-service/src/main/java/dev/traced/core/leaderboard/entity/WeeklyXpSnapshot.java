package dev.traced.core.leaderboard.entity;

import dev.traced.core.profile.entity.UserProfile;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "weekly_xp_snapshots",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_profile_id", "week_start_date"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeeklyXpSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_profile_id", nullable = false)
    private UserProfile userProfile;

    @Column(name = "week_start_date", nullable = false)
    private LocalDate weekStartDate;

    @Column(name = "xp_earned_this_week", nullable = false)
    @Builder.Default
    private Integer xpEarnedThisWeek = 0;

    @Column(name = "rank_this_week")
    private Integer rankThisWeek;

    @Column(nullable = false)
    @Builder.Default
    private Boolean archived = false;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
