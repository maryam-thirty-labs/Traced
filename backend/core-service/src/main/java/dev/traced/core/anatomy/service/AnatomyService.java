package dev.traced.core.anatomy.service;

import dev.traced.core.anatomy.entity.AnatomyPart;
import dev.traced.core.anatomy.repository.AnatomyPartRepository;
import dev.traced.core.common.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnatomyService {

    private final AnatomyPartRepository anatomyPartRepository;

    public AnatomyPart findByCanonicalId(String canonicalId) {
        return anatomyPartRepository.findByCanonicalId(canonicalId)
            .orElseThrow(() -> new EntityNotFoundException("AnatomyPart", canonicalId));
    }
}
