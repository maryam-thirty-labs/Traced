package dev.traced.core.notifications.repository;

import dev.traced.core.notifications.entity.UserPushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserPushSubscriptionRepository extends JpaRepository<UserPushSubscription, UUID> {
    List<UserPushSubscription> findByUserId(UUID userId);
    void deleteByUserIdAndEndpoint(UUID userId, String endpoint);
}
