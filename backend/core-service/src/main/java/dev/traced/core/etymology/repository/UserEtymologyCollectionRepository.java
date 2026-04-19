package dev.traced.core.etymology.repository;

import dev.traced.core.etymology.entity.UserEtymologyCollection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserEtymologyCollectionRepository extends JpaRepository<UserEtymologyCollection, UUID> {
    List<UserEtymologyCollection> findByUserId(UUID userId);
    Optional<UserEtymologyCollection> findByUserIdAndRootId(UUID userId, UUID rootId);
}
