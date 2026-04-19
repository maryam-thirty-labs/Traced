package dev.traced.core.etymology.service;

import dev.traced.core.etymology.dto.EtymologyGardenDto;
import dev.traced.core.etymology.entity.EtymologyRoot;
import dev.traced.core.etymology.entity.UserEtymologyCollection;
import dev.traced.core.etymology.repository.EtymologyRootRepository;
import dev.traced.core.etymology.repository.UserEtymologyCollectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EtymologyService {

    // Total target per CLAUDE.md — ~500 roots across all named structures.
    public static final int TOTAL_ROOTS_TARGET = 500;

    private final EtymologyRootRepository rootRepository;
    private final UserEtymologyCollectionRepository collectionRepository;

    @Transactional(readOnly = true)
    public EtymologyGardenDto getGarden(UUID userId) {
        List<EtymologyRoot> roots = rootRepository.findAll();
        List<UserEtymologyCollection> owned = collectionRepository.findByUserId(userId);

        Map<UUID, UserEtymologyCollection> byRoot = new HashMap<>();
        for (UserEtymologyCollection c : owned) byRoot.put(c.getRootId(), c);

        List<EtymologyGardenDto.Entry> entries = roots.stream()
            .map(r -> {
                UserEtymologyCollection c = byRoot.get(r.getId());
                boolean collected = c != null;
                return EtymologyGardenDto.Entry.builder()
                    .id(r.getId())
                    .root(r.getRoot())
                    .origin(collected ? r.getOriginLanguage() : null)
                    .meaning(collected ? r.getMeaning() : null)
                    .exampleStructures(collected ? r.getExampleStructures() : null)
                    .exampleUsage(collected ? r.getExampleUsage() : null)
                    .collected(collected)
                    .collectedAt(c == null ? null : c.getCollectedAt())
                    .build();
            })
            .toList();

        return EtymologyGardenDto.builder()
            .totalRoots(Math.max(TOTAL_ROOTS_TARGET, roots.size()))
            .collected(owned.size())
            .roots(entries)
            .build();
    }

    /** Idempotent — adds only if missing. Returns true on a first-time collect. */
    @Transactional
    public boolean collect(UUID userId, UUID rootId) {
        if (collectionRepository.findByUserIdAndRootId(userId, rootId).isPresent()) {
            return false;
        }
        if (rootRepository.findById(rootId).isEmpty()) {
            throw new IllegalArgumentException("Etymology root not found: " + rootId);
        }
        collectionRepository.save(UserEtymologyCollection.builder()
            .userId(userId)
            .rootId(rootId)
            .build());
        return true;
    }
}
