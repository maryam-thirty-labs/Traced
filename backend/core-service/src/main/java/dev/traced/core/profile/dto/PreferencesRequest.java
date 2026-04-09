package dev.traced.core.profile.dto;

public record PreferencesRequest(
    Boolean etymologyEnabled,
    String preferredSystem
) {}
