package dev.traced.core.speciality.service;

import dev.traced.core.common.EntityNotFoundException;
import dev.traced.core.speciality.dto.SpecialityDetailDto;
import dev.traced.core.speciality.dto.SpecialityDto;
import dev.traced.core.speciality.entity.Speciality;
import dev.traced.core.speciality.repository.SpecialityAnatomyFocusRepository;
import dev.traced.core.speciality.repository.SpecialityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SpecialityService {

    private final SpecialityRepository specialityRepository;
    private final SpecialityAnatomyFocusRepository focusRepository;

    public List<SpecialityDto> listActive() {
        return specialityRepository.findByStatus("ACTIVE").stream()
            .map(this::toSummaryDto)
            .toList();
    }

    public SpecialityDetailDto getDetail(String canonicalId) {
        Speciality s = specialityRepository.findByCanonicalId(canonicalId)
            .orElseThrow(() -> new EntityNotFoundException("Speciality", canonicalId));

        if (!"ACTIVE".equals(s.getStatus())) {
            throw new EntityNotFoundException("Speciality", canonicalId);
        }

        List<SpecialityDetailDto.FocusAnatomyDto> focus = focusRepository
            .findBySpecialityCanonicalId(canonicalId).stream()
            .map(f -> SpecialityDetailDto.FocusAnatomyDto.builder()
                .anatomyCanonicalId(f.getAnatomyPart().getCanonicalId())
                .displayName(f.getAnatomyPart().getDisplayName())
                .focusReason(f.getFocusReason())
                .clinicalRelevance(f.getClinicalRelevance())
                .build())
            .toList();

        return SpecialityDetailDto.builder()
            .canonicalId(s.getCanonicalId())
            .name(s.getName())
            .displayName(s.getDisplayName())
            .focusDescription(s.getFocusDescription())
            .focusAnatomy(focus)
            .build();
    }

    public List<SpecialityDetailDto.FocusAnatomyDto> getAnatomyFocusForSpeciality(String anatomyCanonicalId, String specialityCanonicalId) {
        return focusRepository.findByAnatomyCanonicalId(anatomyCanonicalId).stream()
            .filter(f -> f.getSpeciality().getCanonicalId().equals(specialityCanonicalId))
            .map(f -> SpecialityDetailDto.FocusAnatomyDto.builder()
                .anatomyCanonicalId(f.getAnatomyPart().getCanonicalId())
                .displayName(f.getAnatomyPart().getDisplayName())
                .focusReason(f.getFocusReason())
                .clinicalRelevance(f.getClinicalRelevance())
                .build())
            .toList();
    }

    private SpecialityDto toSummaryDto(Speciality s) {
        return SpecialityDto.builder()
            .canonicalId(s.getCanonicalId())
            .name(s.getName())
            .displayName(s.getDisplayName())
            .focusDescription(s.getFocusDescription())
            .build();
    }
}
