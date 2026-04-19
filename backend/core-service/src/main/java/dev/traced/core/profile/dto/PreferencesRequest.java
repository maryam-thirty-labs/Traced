package dev.traced.core.profile.dto;

import jakarta.validation.constraints.Pattern;

public record PreferencesRequest(
    Boolean etymologyEnabled,
    String preferredSystem,
    String university,
    // Must match the DB CHECK constraint on user_profiles.background exactly.
    @Pattern(regexp = "^(curious_adult|med_student|fitness|health_scare)$",
             message = "background must be one of: curious_adult, med_student, fitness, health_scare")
    String background
) {}
