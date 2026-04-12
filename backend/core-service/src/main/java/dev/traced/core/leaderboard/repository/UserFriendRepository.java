package dev.traced.core.leaderboard.repository;

import dev.traced.core.leaderboard.entity.UserFriend;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface UserFriendRepository extends JpaRepository<UserFriend, UUID> {

    @Query("SELECT f FROM UserFriend f JOIN FETCH f.friendProfile WHERE f.userProfile.id = :userProfileId")
    List<UserFriend> findByUserProfileId(UUID userProfileId);

    boolean existsByUserProfileIdAndFriendProfileId(UUID userProfileId, UUID friendProfileId);

    void deleteByUserProfileIdAndFriendProfileId(UUID userProfileId, UUID friendProfileId);
}
