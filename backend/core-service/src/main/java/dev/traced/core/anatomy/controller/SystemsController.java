package dev.traced.core.anatomy.controller;

import dev.traced.core.anatomy.dto.BodySystemSummaryDto;
import dev.traced.core.anatomy.entity.BodySystem;
import dev.traced.core.anatomy.repository.AnatomyPartRepository;
import dev.traced.core.anatomy.repository.BodySystemRepository;
import dev.traced.core.lesson.entity.AnatomyStructureProgress;
import dev.traced.core.lesson.repository.AnatomyStructureProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/anatomy/systems")
@RequiredArgsConstructor
public class SystemsController {

    private final BodySystemRepository systemRepository;
    private final AnatomyPartRepository partRepository;
    private final AnatomyStructureProgressRepository progressRepository;

    @GetMapping
    public ResponseEntity<List<BodySystemSummaryDto>> listSystems(Authentication auth) {
        UUID userId = auth == null ? null : (UUID) auth.getPrincipal();

        List<BodySystem> systems = systemRepository.findAllByStatusOrderByDisplayOrderAsc("ACTIVE");

        // Preload explored structure IDs for this user (if authenticated).
        Set<UUID> exploredIds = new HashSet<>();
        if (userId != null) {
            for (AnatomyStructureProgress p : progressRepository.findByUserId(userId)) {
                if (p.getExploredAt() != null) exploredIds.add(p.getStructureId());
            }
        }

        // Per-system structure counts + explored counts.
        Map<UUID, int[]> perSystem = new HashMap<>();
        for (BodySystem sys : systems) {
            int[] counts = new int[]{0, 0}; // [total, explored]
            partRepository.findBySystemIdOrderByDisplayName(sys.getId()).forEach(p -> {
                counts[0]++;
                if (exploredIds.contains(p.getId())) counts[1]++;
            });
            perSystem.put(sys.getId(), counts);
        }

        List<BodySystemSummaryDto> out = systems.stream()
            .map(sys -> BodySystemSummaryDto.builder()
                .id(sys.getId())
                .canonicalId(sys.getCanonicalId())
                .name(sys.getName())
                .displayOrder(sys.getDisplayOrder())
                .structureCount(perSystem.get(sys.getId())[0])
                .exploredCount(perSystem.get(sys.getId())[1])
                .build())
            .toList();

        return ResponseEntity.ok(out);
    }
}
