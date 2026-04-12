package dev.traced.core.leaderboard.entity;

import dev.traced.core.profile.entity.UserProfile;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "user_friends",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_profile_id", "friend_profile_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserFriend {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_profile_id", nullable = false)
    private UserProfile userProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "friend_profile_id", nullable = false)
    private UserProfile friendProfile;

    @Column(name = "added_at", nullable = false)
    @Builder.Default
    private LocalDateTime addedAt = LocalDateTime.now();
}
