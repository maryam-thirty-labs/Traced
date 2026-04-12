package dev.traced.core.leaderboard.service;

import dev.traced.core.common.EntityNotFoundException;
import dev.traced.core.leaderboard.entity.UserFriend;
import dev.traced.core.leaderboard.repository.UserFriendRepository;
import dev.traced.core.profile.entity.UserProfile;
import dev.traced.core.profile.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FriendsService {

    private final UserFriendRepository friendRepository;
    private final UserProfileRepository userProfileRepository;

    public List<UserProfile> listFriends(UUID userProfileId) {
        return friendRepository.findByUserProfileId(userProfileId).stream()
            .map(UserFriend::getFriendProfile)
            .toList();
    }

    @Transactional
    public UUID addFriendByDisplayName(UUID myProfileId, String displayName) {
        if (displayName == null || displayName.isBlank()) {
            throw new IllegalArgumentException("displayName is required");
        }

        UserProfile me = userProfileRepository.findById(myProfileId)
            .orElseThrow(() -> new EntityNotFoundException("UserProfile", myProfileId.toString()));

        UserProfile friend = userProfileRepository.findAll().stream()
            .filter(p -> displayName.equalsIgnoreCase(p.getDisplayName()))
            .findFirst()
            .orElseThrow(() -> new EntityNotFoundException("UserProfile", displayName));

        if (friend.getId().equals(me.getId())) {
            throw new IllegalArgumentException("You cannot add yourself");
        }

        if (friendRepository.existsByUserProfileIdAndFriendProfileId(me.getId(), friend.getId())) {
            throw new DataIntegrityViolationException("Already friends");
        }

        UserFriend rel = UserFriend.builder()
            .userProfile(me)
            .friendProfile(friend)
            .build();
        friendRepository.save(rel);
        return friend.getId();
    }

    @Transactional
    public void removeFriend(UUID myProfileId, UUID friendProfileId) {
        friendRepository.deleteByUserProfileIdAndFriendProfileId(myProfileId, friendProfileId);
    }
}
