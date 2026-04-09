package dev.traced.core.relation.entity;

import dev.traced.core.disease.entity.Disease;
import dev.traced.core.treatment.entity.Treatment;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(
    name = "disease_treatment_relations",
    uniqueConstraints = @UniqueConstraint(columnNames = {"disease_id", "treatment_id", "treatment_role"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiseaseTreatmentRelation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disease_id", nullable = false)
    private Disease disease;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "treatment_id", nullable = false)
    private Treatment treatment;

    @Column(name = "treatment_role", nullable = false)
    private String treatmentRole;

    @Column(name = "line_of_therapy")
    private Integer lineOfTherapy;
}
