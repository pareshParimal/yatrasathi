package com.yatrasathi.backend.chat.controller;

import com.yatrasathi.backend.chat.dto.ChatRequest;
import com.yatrasathi.backend.chat.entity.ChatMessage;
import com.yatrasathi.backend.chat.service.ChatService;
import com.yatrasathi.backend.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/chat/sessions")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<ApiResponse<ChatMessage>> startOrContinueSession(
            @RequestParam(required = false) UUID sessionId,
            @RequestBody ChatRequest request,
            @RequestHeader("X-User-Id") UUID userId // Using header for MVP without real auth token
    ) {
        ChatMessage message = chatService.sendMessage(sessionId, request, userId);
        return ResponseEntity.ok(ApiResponse.success(message));
    }
}
