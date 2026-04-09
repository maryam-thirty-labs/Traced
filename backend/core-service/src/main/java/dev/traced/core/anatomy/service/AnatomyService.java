package dev.traced.core.anatomy.service;

import dev.traced.core.anatomy.entity.AnatomyPart;
import dev.traced.core.anatomy.repository.AnatomyPartRepository;
import dev.traced.core.common.EntityNotFoundException;
import dev.traced.core.disease.entity.Disease;
import dev.traced.core.mechanism.entity.Mechanism;
import dev.traced.core.relation.entity.AnatomyDiseaseRelation;
import dev.traced.core.relation.entity.DiseaseMechanismRelation;
import dev.traced.core.relation.repository.AnatomyDiseaseRelationRepository;
import dev.traced.core.relation.repository.DiseaseMechanismRelationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnatomyService {

    private final AnatomyPartRepository anatomyPartRepository;
    private final AnatomyDiseaseRelationRepository anatomyDiseaseRelationRepository;
    private final DiseaseMechanismRelationRepository diseaseMechanismRelationRepository;

    public AnatomyPart findByCanonicalId(String canonicalId) {
        return anatomyPartRepository.findByCanonicalId(canonicalId)
            .orElseThrow(() -> new EntityNotFoundException("AnatomyPart", canonicalId));
    }

    public List<Disease> findDiseasesByCanonicalId(String canonicalId) {
        var part = findByCanonicalId(canonicalId);
        return anatomyDiseaseRelationRepository.findByAnatomyPartId(part.getId())
            .stream()
            .map(AnatomyDiseaseRelation::getDisease)
            .toList();
    }

    public List<Mechanism> findMechanismsByCanonicalId(String canonicalId) {
        var diseases = findDiseasesByCanonicalId(canonicalId);
        return diseases.stream()
            .flatMap(d -> diseaseMechanismRelationRepository.findByDiseaseId(d.getId()).stream())
            .map(DiseaseMechanismRelation::getMechanism)
            .distinct()
            .toList();
    }
}
