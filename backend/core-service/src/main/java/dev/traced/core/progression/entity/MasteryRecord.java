package dev.traced.core.progression.entity;

import dev.traced.core.profile.entity.UserProfile;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "mastery_records",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_profile_id", "system_canonical_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MasteryRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_profile_id", nullable = false)
    private UserProfile userProfile;

    @Column(name = "system_canonical_id", nullable = false)
    private String systemCanonicalId;

    @Column(name = "mastery_pct", nullable = false, precision = 5, scale = 2)
    private BigDecimal masteryPct;

    @Column(name = "cases_attempted", nullable = false)
    @Builder.Default
    private Integer casesAttempted = 0;

    @Column(name = "cases_correct", nullable = false)
    @Builder.Default
    private Integer casesCorrect = 0;

    @Column(name = "last_updated_at")
    private LocalDateTime lastUpdatedAt;
}
