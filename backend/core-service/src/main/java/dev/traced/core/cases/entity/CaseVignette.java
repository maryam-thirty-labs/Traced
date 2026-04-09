package dev.traced.core.cases.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "case_vignettes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaseVignette {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", nullable = false, unique = true)
    private Case linkedCase;

    @Column(name = "patient_age")
    private Integer patientAge;

    @Column(name = "patient_sex")
    private String patientSex;

    @Column(name = "presenting_complaint", columnDefinition = "TEXT")
    private String presentingComplaint;

    @Column(name = "history_text", columnDefinition = "TEXT")
    private String historyText;

    @Column(name = "full_vignette_text", columnDefinition = "TEXT", nullable = false)
    private String fullVignetteText;
}
