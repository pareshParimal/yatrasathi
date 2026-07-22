package com.yatrasathi.backend.chat.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.List;

@Slf4j
@Service
public class GeminiService {

    private final WebClient webClient;
    private final String apiKey;

    public GeminiService(WebClient.Builder webClientBuilder, @Value("${gemini.api.key:mock_key}") String apiKey) {
        this.webClient = webClientBuilder.baseUrl("https://generativelanguage.googleapis.com/v1beta").build();
        this.apiKey = apiKey;
    }

    public Mono<String> generateContent(String prompt) {
        if ("mock_key".equals(apiKey)) {
            log.info("Using mock Gemini response since no real GEMINI_API_KEY is provided.");
            return Mono.just("This is a simulated response from the AI. Provide a real GEMINI_API_KEY in the environment to get actual answers.");
        }

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                )
        );

        return webClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/models/gemini-flash-latest:generateContent")
                        .queryParam("key", apiKey)
                        .build())
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> {
                    try {
                        List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                        return (String) parts.get(0).get("text");
                    } catch (Exception e) {
                        log.error("Failed to parse Gemini response: {}", response, e);
                        return "Sorry, I had trouble generating a response.";
                    }
                })
                .onErrorResume(e -> {
                    log.error("Error communicating with Gemini API", e);
                    return Mono.just("Sorry, the AI service is currently unavailable.");
                });
    }
}
