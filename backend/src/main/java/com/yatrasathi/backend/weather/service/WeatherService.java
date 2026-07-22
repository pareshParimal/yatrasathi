package com.yatrasathi.backend.weather.service;

import com.yatrasathi.backend.place.entity.Place;
import com.yatrasathi.backend.place.repository.PlaceRepository;
import com.yatrasathi.backend.weather.client.OpenWeatherClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WeatherService {

    private final PlaceRepository placeRepository;
    private final OpenWeatherClient weatherClient;
    private final ClothingAdvisor clothingAdvisor;

    public Map<String, Object> getPlaceWeatherAndAdvice(UUID placeId) {
        Place place = placeRepository.findById(placeId)
                .orElseThrow(() -> new IllegalArgumentException("Place not found"));

        Map<String, Object> weatherData = weatherClient.getCurrentWeather(place.getLatitude(), place.getLongitude()).block();
        
        java.util.List<String> advice = clothingAdvisor.recommendClothing(weatherData);

        return Map.of(
                "place", place.getName(),
                "weather", weatherData,
                "clothingAdvice", advice
        );
    }
}
