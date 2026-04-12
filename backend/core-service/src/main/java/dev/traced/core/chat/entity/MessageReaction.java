package dev.traced.core.chat.entity;

import dev.traced.core.profile.entity.UserProfile;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(
    name = "message_reactions",
    uniqueConstraints = @UniqueConstraint(columnNames = {"message_id", "user_profile_id", "reaction_emoji"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageReaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id", nullable = false)
    private ChatMessage message;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_profile_id", nullable = false)
    private UserProfile userProfile;

    @Column(name = "reaction_emoji", nullable = false, length = 16)
    private String reactionEmoji;
}
