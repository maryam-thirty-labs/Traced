package dev.traced.core.relation.entity;

import dev.traced.core.anatomy.entity.AnatomyPart;
import dev.traced.core.disease.entity.Disease;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(
    name = "anatomy_disease_relations",
    uniqueConstraints = @UniqueConstraint(columnNames = {"anatomy_part_id", "disease_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnatomyDiseaseRelation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "anatomy_part_id", nullable = false)
    private AnatomyPart anatomyPart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disease_id", nullable = false)
    private Disease disease;

    @Column(name = "relation_strength", nullable = false)
    private String relationStrength;
}
