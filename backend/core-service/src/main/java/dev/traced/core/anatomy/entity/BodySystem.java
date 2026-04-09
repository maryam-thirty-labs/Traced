package dev.traced.core.anatomy.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "body_systems")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BodySystem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "canonical_id", nullable = false, unique = true)
    private String canonicalId;

    @Column(nullable = false)
    private String name;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Column(nullable = false)
    @Builder.Default
    private String status = "ACTIVE";
}
