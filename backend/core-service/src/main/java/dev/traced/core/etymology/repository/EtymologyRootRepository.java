package dev.traced.core.etymology.repository;

import dev.traced.core.etymology.entity.EtymologyRoot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EtymologyRootRepository extends JpaRepository<EtymologyRoot, UUID> {
    Optional<EtymologyRoot> findByRoot(String root);
}
