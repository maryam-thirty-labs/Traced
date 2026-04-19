package dev.traced.core.etymology.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "etymology_roots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EtymologyRoot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 100)
    private String root;

    @Column(name = "origin_language", nullable = false, length = 20)
    private String originLanguage;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String meaning;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "example_structures", columnDefinition = "TEXT[]")
    private List<String> exampleStructures;

    @Column(name = "example_usage", nullable = false, columnDefinition = "TEXT")
    private String exampleUsage;

    @Column(name = "illustration_url", columnDefinition = "TEXT")
    private String illustrationUrl;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
