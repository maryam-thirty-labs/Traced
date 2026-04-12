package dev.traced.core.chat.controller;

import dev.traced.core.chat.entity.ChatMessage;
import dev.traced.core.chat.repository.ChatMessageRepository;
import dev.traced.core.common.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/chat")
@RequiredArgsConstructor
public class AdminChatController {

    private final ChatMessageRepository messageRepository;

    @PostMapping("/messages/{messageId}/flag")
    public ResponseEntity<Map<String, String>> flag(@PathVariable UUID messageId) {
        return updateStatus(messageId, "FLAGGED");
    }

    @PostMapping("/messages/{messageId}/remove")
    public ResponseEntity<Map<String, String>> remove(@PathVariable UUID messageId) {
        return updateStatus(messageId, "REMOVED");
    }

    @GetMapping("/messages/{messageId}")
    public ResponseEntity<Map<String, Object>> getAny(@PathVariable UUID messageId) {
        ChatMessage m = messageRepository.findById(messageId)
            .orElseThrow(() -> new EntityNotFoundException("ChatMessage", messageId.toString()));
        return ResponseEntity.ok(Map.of(
            "messageId", m.getId().toString(),
            "status", m.getStatus(),
            "messageText", m.getMessageText(),
            "authorProfileId", m.getAuthorProfile().getId().toString(),
            "sentAt", m.getSentAt().toString()
        ));
    }

    private ResponseEntity<Map<String, String>> updateStatus(UUID messageId, String status) {
        ChatMessage m = messageRepository.findById(messageId)
            .orElseThrow(() -> new EntityNotFoundException("ChatMessage", messageId.toString()));
        m.setStatus(status);
        messageRepository.save(m);
        return ResponseEntity.ok(Map.of("messageId", messageId.toString(), "status", status));
    }
}
