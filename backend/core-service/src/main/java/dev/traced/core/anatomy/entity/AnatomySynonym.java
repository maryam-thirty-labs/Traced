package dev.traced.core.anatomy.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "anatomy_synonyms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnatomySynonym {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "anatomy_part_id", nullable = false)
    private AnatomyPart anatomyPart;

    @Column(nullable = false)
    private String synonym;

    @Column(name = "synonym_type", nullable = false)
    private String synonymType;
}
