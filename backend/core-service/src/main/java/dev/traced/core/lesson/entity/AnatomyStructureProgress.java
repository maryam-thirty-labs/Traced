package dev.traced.core.lesson.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Per-user, per-structure progression.
 * All writes go through LearningLoopService. Controllers never write directly.
 */
@Entity
@Table(name = "anatomy_structure_progress")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnatomyStructureProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "structure_id", nullable = false)
    private UUID structureId;

    @Column(name = "first_seen_at", nullable = false)
    @Builder.Default
    private LocalDateTime firstSeenAt = LocalDateTime.now();

    @Column(name = "explored_at")
    private LocalDateTime exploredAt;

    @Column(name = "last_explored_at")
    private LocalDateTime lastExploredAt;

    @Column(name = "last_reviewed_at")
    private LocalDateTime lastReviewedAt;

    @Column(name = "review_count", nullable = false)
    @Builder.Default
    private Integer reviewCount = 0;

    @Column(name = "first_source", nullable = false, length = 20)
    @Builder.Default
    private String firstSource = "LESSON";
}
