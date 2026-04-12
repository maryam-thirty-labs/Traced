package dev.traced.core.chat.controller;

import dev.traced.core.chat.dto.ChatChannelDto;
import dev.traced.core.chat.dto.ChatMessageDto;
import dev.traced.core.chat.entity.ChatChannel;
import dev.traced.core.chat.entity.ChatMessage;
import dev.traced.core.chat.entity.MessageReaction;
import dev.traced.core.chat.repository.ChatMessageRepository;
import dev.traced.core.chat.repository.MessageReactionRepository;
import dev.traced.core.chat.service.ChatChannelService;
import dev.traced.core.chat.service.ChatMessageService;
import dev.traced.core.chat.service.MessageReactionService;
import dev.traced.core.common.EntityNotFoundException;
import dev.traced.core.profile.entity.UserProfile;
import dev.traced.core.profile.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatChannelService channelService;
    private final ChatMessageService messageService;
    private final MessageReactionService reactionService;
    private final ChatMessageRepository messageRepository;
    private final MessageReactionRepository reactionRepository;
    private final UserProfileRepository userProfileRepository;

    private UUID resolveProfileId(Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        UserProfile p = userProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new EntityNotFoundException("UserProfile", userId.toString()));
        return p.getId();
    }

    // --- channels ---

    @GetMapping("/channels")
    public ResponseEntity<List<ChatChannelDto>> listChannels() {
        List<ChatChannel> channels = channelService.listActive();
        List<ChatChannelDto> out = channels.stream()
            .map(c -> ChatChannelDto.builder()
                .channelId(c.getChannelId())
                .displayName(c.getDisplayName())
                .messageCount(messageRepository.countByChannelIdAndStatus(c.getId(), "VISIBLE"))
                .lastActivityAt(messageRepository.findMostRecentAt(c.getId()).orElse(null))
                .build())
            .toList();
        return ResponseEntity.ok(out);
    }

    @PostMapping("/channels")
    public ResponseEntity<ChatChannelDto> createChannel(
        Authentication auth,
        @RequestBody Map<String, String> body
    ) {
        UUID userId = (UUID) auth.getPrincipal();
        String channelId = body.get("channelId");
        String displayName = body.getOrDefault("displayName", channelId);
        ChatChannel c = channelService.create(channelId, displayName, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ChatChannelDto.builder()
            .channelId(c.getChannelId())
            .displayName(c.getDisplayName())
            .messageCount(0)
            .lastActivityAt(null)
            .build());
    }

    // --- messages ---

    @GetMapping("/channels/{channelId}/messages")
    public ResponseEntity<List<ChatMessageDto>> listMessages(
        @PathVariable String channelId,
        @RequestParam(required = false) String before,
        @RequestParam(defaultValue = "50") int limit
    ) {
        LocalDateTime beforeDt = (before != null && !before.isBlank())
            ? LocalDateTime.parse(before)
            : null;
        List<ChatMessage> messages = messageService.listMessages(channelId, beforeDt, limit);
        List<UUID> ids = messages.stream().map(ChatMessage::getId).toList();
        Map<UUID, Map<String, Integer>> reactionsByMessage = groupReactions(ids);

        List<ChatMessageDto> out = messages.stream()
            .map(m -> ChatMessageDto.builder()
                .messageId(m.getId().toString())
                .channelId(channelId)
                .authorDisplayName(m.getAuthorProfile().getDisplayName())
                .messageText(m.getMessageText())
                .sentAt(m.getSentAt())
                .reactionCounts(reactionsByMessage.getOrDefault(m.getId(), Map.of()))
                .build())
            .toList();
        return ResponseEntity.ok(out);
    }

    @PostMapping("/channels/{channelId}/messages")
    public ResponseEntity<ChatMessageDto> sendMessage(
        Authentication auth,
        @PathVariable String channelId,
        @RequestBody Map<String, String> body
    ) {
        UUID profileId = resolveProfileId(auth);
        ChatMessage m = messageService.send(channelId, profileId, body.get("messageText"));
        return ResponseEntity.status(HttpStatus.CREATED).body(ChatMessageDto.builder()
            .messageId(m.getId().toString())
            .channelId(channelId)
            .authorDisplayName(m.getAuthorProfile().getDisplayName())
            .messageText(m.getMessageText())
            .sentAt(m.getSentAt())
            .reactionCounts(Map.of())
            .build());
    }

    // --- reactions ---

    @PostMapping("/channels/{channelId}/messages/{messageId}/react")
    public ResponseEntity<Map<String, String>> react(
        Authentication auth,
        @PathVariable String channelId,
        @PathVariable UUID messageId,
        @RequestBody Map<String, String> body
    ) {
        UUID profileId = resolveProfileId(auth);
        reactionService.addReaction(messageId, profileId, body.get("reactionEmoji"));
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "messageId", messageId.toString(),
            "status", "added"
        ));
    }

    // --- user flag (sprint 10.6 wire-through lives here too) ---

    @PostMapping("/messages/{messageId}/flag")
    public ResponseEntity<Map<String, String>> flagMessage(
        Authentication auth,
        @PathVariable UUID messageId
    ) {
        ChatMessage m = messageService.findById(messageId);
        UUID myProfileId = resolveProfileId(auth);
        if (m.getAuthorProfile().getId().equals(myProfileId)) {
            throw new IllegalArgumentException("You cannot flag your own message");
        }
        m.setStatus("FLAGGED");
        messageRepository.save(m);
        return ResponseEntity.ok(Map.of("messageId", messageId.toString(), "status", "FLAGGED"));
    }

    // --- helpers ---

    private Map<UUID, Map<String, Integer>> groupReactions(List<UUID> messageIds) {
        if (messageIds.isEmpty()) return Map.of();
        List<MessageReaction> reactions = reactionRepository.findByMessageIdIn(messageIds);
        Map<UUID, Map<String, Integer>> map = new HashMap<>();
        for (MessageReaction r : reactions) {
            UUID msgId = r.getMessage().getId();
            Map<String, Integer> counts = map.computeIfAbsent(msgId, k -> new HashMap<>());
            counts.merge(r.getReactionEmoji(), 1, Integer::sum);
        }
        return map;
    }
}
