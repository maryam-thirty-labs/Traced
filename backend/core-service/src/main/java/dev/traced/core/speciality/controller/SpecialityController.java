package dev.traced.core.speciality.controller;

import dev.traced.core.speciality.dto.SpecialityDetailDto;
import dev.traced.core.speciality.dto.SpecialityDto;
import dev.traced.core.speciality.service.SpecialityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class SpecialityController {

    private final SpecialityService specialityService;

    @GetMapping("/api/specialities")
    public ResponseEntity<List<SpecialityDto>> list() {
        return ResponseEntity.ok(specialityService.listActive());
    }

    @GetMapping("/api/specialities/{canonicalId}")
    public ResponseEntity<SpecialityDetailDto> get(@PathVariable String canonicalId) {
        return ResponseEntity.ok(specialityService.getDetail(canonicalId));
    }

    @GetMapping("/api/anatomy/parts/{canonicalId}/speciality-focus")
    public ResponseEntity<List<SpecialityDetailDto.FocusAnatomyDto>> anatomyFocus(
        @PathVariable String canonicalId,
        @RequestParam String speciality
    ) {
        return ResponseEntity.ok(specialityService.getAnatomyFocusForSpeciality(canonicalId, speciality));
    }
}
