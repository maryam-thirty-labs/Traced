package dev.traced.core.lesson.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "daily_lesson_retrieval_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyLessonRetrievalItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "lesson_id", nullable = false)
    private UUID lessonId;

    @Column(name = "structure_id", nullable = false)
    private UUID structureId;

    @Column(name = "answered_correctly")
    private Boolean answeredCorrectly;

    @Column(name = "answered_at")
    private LocalDateTime answeredAt;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;
}
