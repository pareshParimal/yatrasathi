package com.yatrasathi.backend.weather.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@Slf4j
@Service
public class OpenWeatherClient {

    private final WebClient webClient;
    private final String apiKey;

    public OpenWeatherClient(WebClient.Builder webClientBuilder, @Value("${OPENWEATHER_API_KEY:mock_key}") String apiKey) {
        this.webClient = webClientBuilder.baseUrl("https://api.openweathermap.org/data/2.5").build();
        this.apiKey = apiKey;
    }

    public Mono<Map> getCurrentWeather(Double lat, Double lon) {
        if ("mock_key".equals(apiKey)) {
            log.info("Using mock OpenWeatherMap API since OPENWEATHER_API_KEY is not provided.");
            return Mono.just(Map.of(
                    "main", Map.of("temp", 30.5, "humidity", 70),
                    "weather", java.util.List.of(Map.of("main", "Rain", "description", "light rain"))
            ));
        }

        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/weather")
                        .queryParam("lat", lat)
                        .queryParam("lon", lon)
                        .queryParam("units", "metric")
                        .queryParam("appid", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(Map.class)
                .onErrorResume(e -> {
                    log.error("Error communicating with OpenWeatherMap API", e);
                    return Mono.just(Map.of());
                });
    }
}
