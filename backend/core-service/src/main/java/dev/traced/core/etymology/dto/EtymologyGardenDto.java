package dev.traced.core.etymology.dto;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Builder
public record EtymologyGardenDto(
    int totalRoots,
    int collected,
    List<Entry> roots
) {
    @Builder
    public record Entry(
        UUID id,
        String root,
        String origin,
        String meaning,
        List<String> exampleStructures,
        String exampleUsage,
        boolean collected,
        LocalDateTime collectedAt
    ) {}
}
