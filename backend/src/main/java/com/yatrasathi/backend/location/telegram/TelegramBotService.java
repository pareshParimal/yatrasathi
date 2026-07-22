package com.yatrasathi.backend.location.telegram;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
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
        this.webClient = webClientBuilder.clone().baseUrl("https://api.telegram.org/bot" + botToken).build();
        this.geminiService = geminiService;
    }

    public void sendLocationUpdate(java.util.List<String> chatIds, String userName, String destinationName, double latitude, double longitude, String specialRequirements) {
        if (chatIds == null || chatIds.isEmpty()) return;
        
        String mapLink = "https://maps.google.com/?q=" + latitude + "," + longitude;
        
        String prompt = "You are an AI assistant for a travel safety app for elderly users in India. " +
                "Write a short, reassuring emergency check-in message to the user's family. " +
                "The user (" + userName + ") is currently on a trip to " + destinationName + ". " +
                "Their medical/special requirements are: " + (specialRequirements != null ? specialRequirements : "None") + ". " +
                "Mention that they are safe and this is an automated location update. " +
                "Include this Google Maps link: " + mapLink + ". " +
                "Keep it under 3 sentences.";

        geminiService.generateContent(prompt).subscribe(message -> {
            for (String chatId : chatIds) {
                sendMessage(chatId, message).subscribe();
            }
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

    /**
     * Calls the Telegram Bot API's getUpdates endpoint and extracts
     * a deduplicated list of users who have messaged the bot.
     * Returns a list of maps, each containing "chatId" and "firstName".
     */
    @SuppressWarnings("unchecked")
    public Mono<List<Map<String, String>>> getRecentUsers() {
        if ("mock_token".equals(botToken)) {
            log.info("Mock Telegram: Returning empty user list (no real token).");
            return Mono.just(List.of());
        }

        return webClient.get()
                .uri("/getUpdates")
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> {
                    LinkedHashMap<String, Map<String, String>> uniqueUsers = new LinkedHashMap<>();
                    List<Map<String, Object>> results = (List<Map<String, Object>>) response.getOrDefault("result", List.of());

                    for (Map<String, Object> update : results) {
                        Map<String, Object> message = (Map<String, Object>) update.get("message");
                        if (message == null) continue;

                        Map<String, Object> chat = (Map<String, Object>) message.get("chat");
                        if (chat == null) continue;

                        String type = (String) chat.getOrDefault("type", "");
                        if (!"private".equals(type)) continue;

                        String chatId = String.valueOf(chat.get("id"));
                        String firstName = (String) chat.getOrDefault("first_name", "Unknown");
                        String lastName = (String) chat.getOrDefault("last_name", "");

                        String displayName = firstName + (lastName.isEmpty() ? "" : " " + lastName);

                        uniqueUsers.putIfAbsent(chatId, Map.of(
                                "chatId", chatId,
                                "name", displayName
                        ));
                    }

                    List<Map<String, String>> result = new ArrayList<>(uniqueUsers.values());
                    return result;
                })
                .onErrorResume(e -> {
                    log.error("Failed to fetch updates from Telegram API", e);
                    List<Map<String, String>> empty = new ArrayList<>();
                    return Mono.just(empty);
                });
    }
}
