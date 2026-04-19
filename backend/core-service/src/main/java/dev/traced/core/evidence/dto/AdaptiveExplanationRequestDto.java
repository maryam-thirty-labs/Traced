package dev.traced.core.evidence.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record AdaptiveExplanationRequestDto(
    @NotBlank String structureId,
    @NotBlank
    @Pattern(regexp = "^(curious_adult|med_student|fitness|health_scare)$",
             message = "user_background must be one of: curious_adult, med_student, fitness, health_scare")
    String userBackground
) {}
