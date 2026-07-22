package com.yatrasathi.backend.chat.service;

import com.yatrasathi.backend.auth.entity.User;
import com.yatrasathi.backend.auth.repository.UserRepository;
import com.yatrasathi.backend.chat.dto.ChatRequest;
import com.yatrasathi.backend.chat.entity.ChatMessage;
import com.yatrasathi.backend.chat.entity.ChatSession;
import com.yatrasathi.backend.chat.repository.ChatMessageRepository;
import com.yatrasathi.backend.chat.repository.ChatSessionRepository;
import com.yatrasathi.backend.place.entity.Place;
import com.yatrasathi.backend.place.repository.PlaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final GeminiService geminiService;
    private final UserRepository userRepository;
    private final PlaceRepository placeRepository;

    public ChatMessage sendMessage(UUID sessionId, ChatRequest request, UUID userId) {
        ChatSession session;
        if (sessionId == null) {
            User user = userRepository.findById(userId).orElseThrow();
            Place place = request.getPlaceId() != null ? placeRepository.findById(request.getPlaceId()).orElse(null) : null;
            session = ChatSession.builder()
                    .user(user)
                    .place(place)
                    .title("Chat regarding " + (place != null ? place.getName() : "General"))
                    .build();
            session = chatSessionRepository.save(session);
        } else {
            session = chatSessionRepository.findById(sessionId).orElseThrow();
        }

        // Save User Message
        ChatMessage userMsg = ChatMessage.builder()
                .session(session)
                .role("USER")
                .content(request.getMessage())
                .build();
        chatMessageRepository.save(userMsg);

        // Build Prompt Context
        String context = session.getPlace() != null ? "Context: We are talking about " + session.getPlace().getName() + " in India. " : "";
        String fullPrompt = context + "User asks: " + request.getMessage();

        // Get AI Response synchronously (blocking just for simplicity in MVP Controller)
        String aiResponse = geminiService.generateContent(fullPrompt).block();

        // Save AI Message
        ChatMessage aiMsg = ChatMessage.builder()
                .session(session)
                .role("ASSISTANT")
                .content(aiResponse)
                .build();
        return chatMessageRepository.save(aiMsg);
    }
}
