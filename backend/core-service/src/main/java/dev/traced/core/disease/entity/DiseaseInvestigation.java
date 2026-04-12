package dev.traced.core.disease.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "disease_investigations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiseaseInvestigation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disease_id", nullable = false)
    private Disease disease;

    @Column(name = "investigation_name", nullable = false)
    private String investigationName;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String rationale;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;
}
