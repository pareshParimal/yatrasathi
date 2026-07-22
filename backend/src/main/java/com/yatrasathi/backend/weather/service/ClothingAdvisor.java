package com.yatrasathi.backend.weather.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class ClothingAdvisor {

    public List<String> recommendClothing(Map<String, Object> weatherData) {
        List<String> recommendations = new ArrayList<>();
        
        if (weatherData == null || !weatherData.containsKey("main")) {
            recommendations.add("Weather data unavailable. Please carry comfortable multi-purpose clothing.");
            return recommendations;
        }

        Map<String, Object> main = (Map<String, Object>) weatherData.get("main");
        double temp = Double.parseDouble(main.get("temp").toString());
        
        List<Map<String, Object>> weatherDesc = (List<Map<String, Object>>) weatherData.get("weather");
        String condition = "";
        if (weatherDesc != null && !weatherDesc.isEmpty()) {
            condition = (String) weatherDesc.get(0).get("main");
        }

        if (temp > 30) {
            recommendations.add("Light cotton or linen clothing.");
            recommendations.add("Wide-brimmed hat and sunglasses for sun protection.");
        } else if (temp < 15) {
            recommendations.add("Warm layers, thermals, and a good jacket.");
            recommendations.add("Woolen cap and socks.");
        } else {
            recommendations.add("Comfortable full-sleeve clothing with a light jacket just in case.");
        }

        if ("Rain".equalsIgnoreCase(condition) || "Thunderstorm".equalsIgnoreCase(condition)) {
            recommendations.add("Sturdy umbrella or a lightweight raincoat.");
            recommendations.add("Slip-resistant, waterproof footwear (especially important for seniors).");
        }
        
        // General advice for elderly
        recommendations.add("Always carry a small comfortable bag for medications and water.");
        recommendations.add("Wear comfortable, well-cushioned walking shoes.");

        return recommendations;
    }
}
