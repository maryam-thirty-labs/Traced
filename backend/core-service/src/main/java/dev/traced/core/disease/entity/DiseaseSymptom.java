package dev.traced.core.disease.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "disease_symptoms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiseaseSymptom {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disease_id", nullable = false)
    private Disease disease;

    @Column(name = "symptom_name", nullable = false)
    private String symptomName;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String severity;

    @Column(nullable = false)
    private String emoji;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;
}
