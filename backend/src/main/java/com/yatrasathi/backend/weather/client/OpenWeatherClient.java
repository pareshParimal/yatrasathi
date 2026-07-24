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

    private Map<String, Object> generateMockWeather(Double lat, Double lon) {
        // Generate a consistent pseudo-random temperature based on latitude
        double mockTemp = 25.0 + ((Math.abs(lat) % 10) * 1.5) - ((Math.abs(lon) % 5) * 0.5);
        mockTemp = Math.round(mockTemp * 10.0) / 10.0; // round to 1 decimal
        
        int mockHumidity = 50 + (int)((Math.abs(lat) * 7) % 40);
        
        String desc = (Math.abs(lat) + Math.abs(lon)) % 2 == 0 ? "clear sky" : "scattered clouds";
        String main = desc.equals("clear sky") ? "Clear" : "Clouds";

        return Map.of(
                "main", Map.of("temp", mockTemp, "humidity", mockHumidity),
                "weather", java.util.List.of(Map.of("main", main, "description", desc))
        );
    }

    public Mono<Map> getCurrentWeather(Double lat, Double lon) {
        if ("mock_key".equals(apiKey) || apiKey.contains("your_openweather_api_key")) {
            log.info("Using mock OpenWeatherMap API since OPENWEATHER_API_KEY is not provided.");
            return Mono.just(generateMockWeather(lat, lon));
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
                    log.error("Error communicating with OpenWeatherMap API. Falling back to mock data.", e);
                    return Mono.just(generateMockWeather(lat, lon));
                });
    }
}
