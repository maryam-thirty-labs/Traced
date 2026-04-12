package dev.traced.core.chat.repository;

import dev.traced.core.chat.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {

    @Query("SELECT m FROM ChatMessage m JOIN FETCH m.authorProfile WHERE m.channel.id = :channelId AND m.status = 'VISIBLE' AND m.sentAt < :before ORDER BY m.sentAt DESC")
    List<ChatMessage> findVisibleByChannelBefore(UUID channelId, LocalDateTime before, org.springframework.data.domain.Pageable pageable);

    @Query("SELECT m FROM ChatMessage m JOIN FETCH m.authorProfile WHERE m.channel.id = :channelId AND m.status = 'VISIBLE' ORDER BY m.sentAt DESC")
    List<ChatMessage> findVisibleByChannel(UUID channelId, org.springframework.data.domain.Pageable pageable);

    long countByChannelIdAndStatus(UUID channelId, String status);

    @Query("SELECT MAX(m.sentAt) FROM ChatMessage m WHERE m.channel.id = :channelId AND m.status = 'VISIBLE'")
    Optional<LocalDateTime> findMostRecentAt(UUID channelId);
}
