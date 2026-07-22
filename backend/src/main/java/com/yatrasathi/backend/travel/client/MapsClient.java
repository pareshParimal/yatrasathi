package com.yatrasathi.backend.travel.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class MapsClient {

    private final WebClient webClient;
    private final String apiKey;

    public MapsClient(WebClient.Builder webClientBuilder, @Value("${GOOGLE_MAPS_API_KEY:mock_key}") String apiKey) {
        this.webClient = webClientBuilder.baseUrl("https://maps.googleapis.com/maps/api").build();
        this.apiKey = apiKey;
    }

    public Mono<List<Map<String, Object>>> getNearbyHotels(Double lat, Double lng, Double radiusKm) {
        if ("mock_key".equals(apiKey)) {
            log.info("Using mock Google Maps API since GOOGLE_MAPS_API_KEY is not provided.");
            return Mono.just(List.of(
                    Map.of("name", "Mock Heritage Hotel", "vicinity", "Near Temple", "rating", 4.5),
                    Map.of("name", "Mock Budget Stay", "vicinity", "City Center", "rating", 3.8)
            ));
        }

        int radiusMeters = (int) (radiusKm * 1000);
        
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/place/nearbysearch/json")
                        .queryParam("location", lat + "," + lng)
                        .queryParam("radius", radiusMeters)
                        .queryParam("type", "lodging")
                        .queryParam("key", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> {
                    try {
                        return (List<Map<String, Object>>) response.get("results");
                    } catch (Exception e) {
                        log.error("Failed to parse Google Maps response", e);
                        return List.<Map<String, Object>>of();
                    }
                })
                .onErrorResume(e -> {
                    log.error("Error communicating with Google Maps API", e);
                    return Mono.just(List.of());
                });
    }
}
