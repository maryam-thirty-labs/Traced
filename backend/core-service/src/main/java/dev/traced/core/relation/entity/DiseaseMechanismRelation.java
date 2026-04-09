package dev.traced.core.relation.entity;

import dev.traced.core.disease.entity.Disease;
import dev.traced.core.mechanism.entity.Mechanism;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(
    name = "disease_mechanism_relations",
    uniqueConstraints = @UniqueConstraint(columnNames = {"disease_id", "mechanism_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiseaseMechanismRelation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disease_id", nullable = false)
    private Disease disease;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mechanism_id", nullable = false)
    private Mechanism mechanism;
}
