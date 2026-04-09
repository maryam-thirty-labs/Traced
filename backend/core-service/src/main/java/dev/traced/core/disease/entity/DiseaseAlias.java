package dev.traced.core.disease.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "disease_aliases")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiseaseAlias {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disease_id", nullable = false)
    private Disease disease;

    @Column(nullable = false)
    private String alias;

    @Column(name = "alias_type", nullable = false)
    private String aliasType;
}
