package dev.traced.core.chat.repository;

import dev.traced.core.chat.entity.ChatChannel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChatChannelRepository extends JpaRepository<ChatChannel, UUID> {
    Optional<ChatChannel> findByChannelId(String channelId);
    boolean existsByChannelId(String channelId);
    List<ChatChannel> findByStatus(String status);
}
