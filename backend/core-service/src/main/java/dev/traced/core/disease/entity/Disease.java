package dev.traced.core.disease.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

@Entity
@Table(name = "diseases")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Disease {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "canonical_id", nullable = false, unique = true)
    private String canonicalId;

    @Column(nullable = false)
    private String name;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "etymology_json", columnDefinition = "jsonb")
    private String etymologyJson;

    @Column(nullable = false)
    private String commonness;

    private String category;

    @Column(nullable = false)
    @Builder.Default
    private String status = "ACTIVE";
}
