package dev.traced.core.cases.entity;

import dev.traced.core.anatomy.entity.AnatomyPart;
import dev.traced.core.disease.entity.Disease;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "cases")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Case {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "case_id", nullable = false, unique = true)
    private String caseId;

    @Column(nullable = false)
    private String title;

    private String subtitle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "linked_anatomy_id", nullable = false)
    private AnatomyPart linkedAnatomy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "linked_disease_id", nullable = false)
    private Disease linkedDisease;

    @Column(nullable = false)
    private String difficulty;

    @Column(name = "estimated_minutes")
    private Integer estimatedMinutes;

    @Column(name = "xp_reward", nullable = false)
    private Integer xpReward;

    @Column(nullable = false)
    @Builder.Default
    private String status = "ACTIVE";
}
