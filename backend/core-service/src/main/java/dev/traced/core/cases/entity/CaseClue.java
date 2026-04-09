package dev.traced.core.cases.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(
    name = "case_clues",
    uniqueConstraints = @UniqueConstraint(columnNames = {"case_id", "display_order"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaseClue {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", nullable = false)
    private Case linkedCase;

    @Column(name = "clue_type", nullable = false)
    private String clueType;

    @Column(nullable = false)
    private String label;

    @Column(nullable = false)
    private String value;

    @Column(name = "is_abnormal", nullable = false)
    private Boolean isAbnormal;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;
}
