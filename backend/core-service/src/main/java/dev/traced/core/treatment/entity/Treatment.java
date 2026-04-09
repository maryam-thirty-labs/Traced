package dev.traced.core.treatment.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "treatments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Treatment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "canonical_id", nullable = false, unique = true)
    private String canonicalId;

    @Column(nullable = false)
    private String name;

    @Column(name = "treatment_class")
    private String treatmentClass;

    @Column(nullable = false)
    @Builder.Default
    private String status = "ACTIVE";
}
