package com.yatrasathi.backend.tts;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class SarvamClient {

    private final WebClient webClient;
    private final String apiKey;

    public SarvamClient(WebClient.Builder webClientBuilder, @Value("${sarvam.api.key}") String apiKey) {
        this.webClient = webClientBuilder.baseUrl("https://api.sarvam.ai").build();
        this.apiKey = apiKey;
    }

    public byte[] generateSpeech(String text, String languageCode) {
        if ("mock".equals(apiKey) || "your_sarvam_api_key_here".equals(apiKey) || apiKey.isEmpty()) {
            log.warn("Sarvam API key is not configured. Returning empty audio bytes.");
            return new byte[0];
        }

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("inputs", new String[]{text});
        requestBody.put("target_language_code", languageCode);
        requestBody.put("speaker", "shubh");
        requestBody.put("pace", 1.0);
        requestBody.put("speech_sample_rate", 8000);
        requestBody.put("enable_preprocessing", true);
        requestBody.put("model", "bulbul:v3");

        try {
            Map response = webClient.post()
                    .uri("/text-to-speech")
                    .header("api-subscription-key", apiKey)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response != null && response.containsKey("audios")) {
                java.util.List<String> audios = (java.util.List<String>) response.get("audios");
                if (audios != null && !audios.isEmpty()) {
                    String base64Audio = audios.get(0);
                    return java.util.Base64.getDecoder().decode(base64Audio);
                }
            }
            throw new RuntimeException("No audio returned from Sarvam API");
        } catch (Exception e) {
            log.error("Failed to call Sarvam Text-to-Speech API", e);
            throw new RuntimeException("Failed to generate speech", e);
        }
    }
}
