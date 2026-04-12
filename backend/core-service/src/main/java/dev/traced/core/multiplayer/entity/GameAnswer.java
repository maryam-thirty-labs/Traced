package dev.traced.core.multiplayer.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "game_answers",
    uniqueConstraints = @UniqueConstraint(columnNames = {"round_id", "participant_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GameAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "round_id", nullable = false)
    private GameRound round;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_id", nullable = false)
    private GameParticipant participant;

    @Column(name = "answer_value", nullable = false, columnDefinition = "TEXT")
    private String answerValue;

    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect;

    @Column(name = "answered_at", nullable = false)
    @Builder.Default
    private LocalDateTime answeredAt = LocalDateTime.now();

    @Column(name = "points_awarded", nullable = false)
    private Integer pointsAwarded;
}
