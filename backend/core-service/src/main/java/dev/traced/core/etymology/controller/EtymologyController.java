package dev.traced.core.etymology.controller;

import dev.traced.core.etymology.dto.EtymologyGardenDto;
import dev.traced.core.etymology.service.EtymologyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/etymology")
@RequiredArgsConstructor
public class EtymologyController {

    private final EtymologyService service;

    @GetMapping("/garden")
    public ResponseEntity<EtymologyGardenDto> getGarden(Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ResponseEntity.ok(service.getGarden(userId));
    }

    @PostMapping("/{rootId}/collect")
    public ResponseEntity<Map<String, Object>> collect(
        Authentication auth,
        @PathVariable UUID rootId
    ) {
        UUID userId = (UUID) auth.getPrincipal();
        boolean firstTime = service.collect(userId, rootId);
        return ResponseEntity.ok(Map.of("collected", true, "firstTime", firstTime));
    }
}
