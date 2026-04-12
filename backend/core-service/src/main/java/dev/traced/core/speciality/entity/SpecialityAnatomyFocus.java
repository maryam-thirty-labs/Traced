package dev.traced.core.speciality.entity;

import dev.traced.core.anatomy.entity.AnatomyPart;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(
    name = "speciality_anatomy_focus",
    uniqueConstraints = @UniqueConstraint(columnNames = {"speciality_id", "anatomy_part_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpecialityAnatomyFocus {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "speciality_id", nullable = false)
    private Speciality speciality;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "anatomy_part_id", nullable = false)
    private AnatomyPart anatomyPart;

    @Column(name = "focus_reason", columnDefinition = "TEXT")
    private String focusReason;

    @Column(name = "clinical_relevance", columnDefinition = "TEXT")
    private String clinicalRelevance;
}
