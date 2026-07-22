package com.yatrasathi.backend.weather.controller;

import com.yatrasathi.backend.common.dto.ApiResponse;
import com.yatrasathi.backend.weather.service.WeatherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/places/{id}/weather")
@RequiredArgsConstructor
public class WeatherController {

    private final WeatherService weatherService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getWeatherAndAdvice(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(weatherService.getPlaceWeatherAndAdvice(id)));
    }
}
