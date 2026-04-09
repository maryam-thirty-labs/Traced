package dev.traced.core.disease.service;

import dev.traced.core.common.EntityNotFoundException;
import dev.traced.core.disease.entity.Disease;
import dev.traced.core.disease.entity.DiseaseAlias;
import dev.traced.core.disease.repository.DiseaseAliasRepository;
import dev.traced.core.disease.repository.DiseaseRepository;
import dev.traced.core.relation.entity.DiseaseTreatmentRelation;
import dev.traced.core.relation.repository.DiseaseTreatmentRelationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DiseaseService {

    private final DiseaseRepository diseaseRepository;
    private final DiseaseAliasRepository diseaseAliasRepository;
    private final DiseaseTreatmentRelationRepository diseaseTreatmentRelationRepository;

    public Disease findByCanonicalId(String canonicalId) {
        return diseaseRepository.findByCanonicalId(canonicalId)
            .orElseThrow(() -> new EntityNotFoundException("Disease", canonicalId));
    }

    public List<DiseaseAlias> findAliases(String canonicalId) {
        var disease = findByCanonicalId(canonicalId);
        return diseaseAliasRepository.findByDiseaseId(disease.getId());
    }

    public List<DiseaseTreatmentRelation> findTreatmentRelations(String canonicalId) {
        var disease = findByCanonicalId(canonicalId);
        return diseaseTreatmentRelationRepository.findByDiseaseId(disease.getId());
    }
}
