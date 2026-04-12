package dev.traced.core.multiplayer.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "game_rounds",
    uniqueConstraints = @UniqueConstraint(columnNames = {"room_id", "round_number"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GameRound {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private GameRoom room;

    @Column(name = "round_number", nullable = false)
    private Integer roundNumber;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "question_payload", columnDefinition = "jsonb", nullable = false)
    private String questionPayload;

    /** Server-side only — never serialised in any DTO or WebSocket broadcast during active round. */
    @Column(name = "correct_answer", nullable = false, columnDefinition = "TEXT")
    private String correctAnswer;

    @Column(name = "started_at", nullable = false)
    @Builder.Default
    private LocalDateTime startedAt = LocalDateTime.now();

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}
