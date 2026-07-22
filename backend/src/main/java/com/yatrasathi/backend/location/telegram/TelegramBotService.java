package com.yatrasathi.backend.location.telegram;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

import com.yatrasathi.backend.chat.service.GeminiService;

@Slf4j
@Service
public class TelegramBotService {

    private final WebClient webClient;
    private final String botToken;
    private final GeminiService geminiService;

    public TelegramBotService(WebClient.Builder webClientBuilder, 
                              @Value("${TELEGRAM_BOT_TOKEN:mock_token}") String botToken,
                              GeminiService geminiService) {
        this.botToken = botToken;
        this.webClient = webClientBuilder.baseUrl("https://api.telegram.org/bot" + botToken).build();
        this.geminiService = geminiService;
    }

    public void sendLocationUpdate(String userName, String destinationName, double latitude, double longitude, String specialRequirements) {
        String chatId = "645009356"; // For demo purposes, you can change this to a real ID or fetch from DB
        
        String mapLink = "https://maps.google.com/?q=" + latitude + "," + longitude;
        
        String prompt = "You are an AI assistant for a travel safety app for elderly users in India. " +
                "Write a short, reassuring emergency check-in message to the user's family. " +
                "The user (" + userName + ") is currently on a trip to " + destinationName + ". " +
                "Their medical/special requirements are: " + (specialRequirements != null ? specialRequirements : "None") + ". " +
                "Mention that they are safe and this is an automated location update. " +
                "Include this Google Maps link: " + mapLink + ". " +
                "Keep it under 3 sentences.";

        geminiService.generateContent(prompt).subscribe(message -> {
            sendMessage(chatId, message).subscribe();
        });
    }

    public Mono<Boolean> sendLocation(String chatId, Double latitude, Double longitude) {
        if ("mock_token".equals(botToken)) {
            log.info("Mock Telegram: Sending location ({}, {}) to chat {}", latitude, longitude, chatId);
            return Mono.just(true);
        }

        return webClient.post()
                .uri("/sendLocation")
                .bodyValue(Map.of(
                        "chat_id", chatId,
                        "latitude", latitude,
                        "longitude", longitude
                ))
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> (Boolean) response.getOrDefault("ok", false))
                .onErrorResume(e -> {
                    log.error("Failed to send location via Telegram API", e);
                    return Mono.just(false);
                });
    }

    public Mono<Boolean> sendMessage(String chatId, String text) {
        if ("mock_token".equals(botToken)) {
            log.info("Mock Telegram: Sending message '{}' to chat {}", text, chatId);
            return Mono.just(true);
        }

        return webClient.post()
                .uri("/sendMessage")
                .bodyValue(Map.of(
                        "chat_id", chatId,
                        "text", text
                ))
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> (Boolean) response.getOrDefault("ok", false))
                .onErrorResume(e -> {
                    log.error("Failed to send message via Telegram API", e);
                    return Mono.just(false);
                });
    }
}
