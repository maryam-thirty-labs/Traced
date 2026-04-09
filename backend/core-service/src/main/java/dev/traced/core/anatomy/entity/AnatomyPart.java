package dev.traced.core.anatomy.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "anatomy_parts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnatomyPart {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "canonical_id", nullable = false, unique = true)
    private String canonicalId;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "system_id", nullable = false)
    private BodySystem system;

    @Column(nullable = false)
    private String region;

    @Column(columnDefinition = "TEXT")
    private String overview;

    @Column(nullable = false)
    @Builder.Default
    private String status = "ACTIVE";
}
