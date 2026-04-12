package dev.traced.core.chat.entity;

import dev.traced.core.profile.entity.UserProfile;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "channel_id", nullable = false)
    private ChatChannel channel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_profile_id", nullable = false)
    private UserProfile authorProfile;

    @Column(name = "message_text", nullable = false, length = 500)
    private String messageText;

    @Column(name = "sent_at", nullable = false)
    @Builder.Default
    private LocalDateTime sentAt = LocalDateTime.now();

    @Column(nullable = false)
    @Builder.Default
    private String status = "VISIBLE";
}
