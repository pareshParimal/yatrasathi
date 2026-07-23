package com.yatrasathi.backend.travel.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yatrasathi.backend.chat.service.GeminiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class HotelSearchClient {

    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    /**
     * Generates realistic hotel options near a destination using Gemini AI.
     */
    public Mono<List<Map<String, Object>>> searchHotels(
            String destinationCity,
            String nearLandmark,
            Double maxPricePerNight,
            Double radiusKm,
            String language) {

        String prompt = buildPrompt(destinationCity, nearLandmark, maxPricePerNight, radiusKm, language);

        return geminiService.generateContent(prompt)
                .map(response -> parseHotelsFromResponse(response, destinationCity, nearLandmark))
                .onErrorResume(e -> {
                    log.error("Error fetching hotels via Gemini: {}", e.getMessage());
                    return Mono.just(getStaticFallbackHotels(destinationCity, nearLandmark, maxPricePerNight));
                });
    }

    private String buildPrompt(String destinationCity, String nearLandmark, Double maxPrice, Double radiusKm, String language) {
        String priceClause = (maxPrice != null && maxPrice > 0)
                ? "with a maximum budget of ₹" + maxPrice.intValue() + " per night"
                : "across all budget categories (budget to luxury)";

        String landmarkClause = (nearLandmark != null && !nearLandmark.isBlank())
                ? "preferably near " + nearLandmark
                : "well-located for tourists";

        String langDirective = "hi".equalsIgnoreCase(language) ? "Hindi (Devanagari script)" : "English";

        return String.format(
            "You are an expert Indian travel advisor. Generate a JSON array of realistic hotel options " +
            "in %s, India, %s, %s, within approximately %.0f km of the main attraction.\n\n" +
            "CRITICAL: All textual data (hotel names, vicinity, amenities) MUST be written in %s.\n\n" +
            "Return ONLY a valid JSON array with exactly 4 hotels. Each hotel must have these fields:\n" +
            "- name: realistic hotel name in %s (use real Indian hotel brand names like Taj, Lemon Tree, FabHotel, OYO, Treebo, etc.)\n" +
            "- rating: rating out of 5.0 (number with 1 decimal, e.g. 4.2)\n" +
            "- price: price per night in INR (integer)\n" +
            "- priceCategory: one of [\"Budget\", \"Mid-range\", \"Luxury\"]\n" +
            "- vicinity: brief location description in %s (e.g. \"Near Taj Mahal Gate 2\")\n" +
            "- nearDescription: distance string in %s (e.g. \"~1.2 km from Taj Mahal\")\n" +
            "- amenities: array of 3-5 relevant amenities chosen from: [\"Free WiFi\", \"AC\", \"Lift\", \"Ground Floor Available\", \"Vegetarian Kitchen\", \"Jain Food Available\", \"Multi-cuisine Restaurant\", \"Wheelchair Accessible\", \"Medical Assistance\", \"24x7 Reception\", \"Taxi Service\"] and translated to %s\n" +
            "- checkIn: check-in time (e.g. \"12:00 PM\")\n" +
            "- checkOut: check-out time (e.g. \"11:00 AM\")\n\n" +
            "Return ONLY the JSON array, no explanation, no markdown code blocks.",
            destinationCity, landmarkClause, priceClause, radiusKm != null ? radiusKm : 5.0, langDirective, langDirective, langDirective, langDirective, langDirective
        );
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> parseHotelsFromResponse(String response, String destinationCity, String nearLandmark) {
        try {
            String cleaned = response.trim();
            if (cleaned.startsWith("```")) {
                cleaned = cleaned.replaceAll("```json\\n?", "").replaceAll("```\\n?", "").trim();
            }
            List<Map<String, Object>> hotels = objectMapper.readValue(cleaned, List.class);
            log.info("Gemini returned {} hotels for {}", hotels.size(), destinationCity);
            return hotels;
        } catch (Exception e) {
            log.warn("Could not parse Gemini hotel response, using fallback. Error: {}", e.getMessage());
            return getStaticFallbackHotels(destinationCity, nearLandmark, null);
        }
    }

    private List<Map<String, Object>> getStaticFallbackHotels(String city, String landmark, Double maxPrice) {
        log.info("Returning static fallback hotel data for {}", city);
        String near = landmark != null && !landmark.isBlank() ? landmark : city;
        List<Map<String, Object>> hotels = new ArrayList<>();

        Map<String, Object> h1 = new HashMap<>();
        h1.put("name", "Taj Hotel & Convention Centre"); h1.put("rating", 4.8); h1.put("price", 9500);
        h1.put("priceCategory", "Luxury"); h1.put("vicinity", "City Center");
        h1.put("nearDescription", "~0.8 km from " + near);
        h1.put("amenities", List.of("Free WiFi", "AC", "Lift", "Vegetarian Kitchen", "Medical Assistance"));
        h1.put("checkIn", "2:00 PM"); h1.put("checkOut", "12:00 PM");
        hotels.add(h1);

        Map<String, Object> h2 = new HashMap<>();
        h2.put("name", "Lemon Tree Premier"); h2.put("rating", 4.2); h2.put("price", 4800);
        h2.put("priceCategory", "Mid-range"); h2.put("vicinity", "Near Railway Station");
        h2.put("nearDescription", "~1.5 km from " + near);
        h2.put("amenities", List.of("Free WiFi", "AC", "Lift", "Multi-cuisine Restaurant", "Wheelchair Accessible"));
        h2.put("checkIn", "12:00 PM"); h2.put("checkOut", "11:00 AM");
        hotels.add(h2);

        Map<String, Object> h3 = new HashMap<>();
        h3.put("name", "Treebo Trend Heritage Inn"); h3.put("rating", 4.0); h3.put("price", 2400);
        h3.put("priceCategory", "Mid-range"); h3.put("vicinity", "Old Town");
        h3.put("nearDescription", "~2.1 km from " + near);
        h3.put("amenities", List.of("Free WiFi", "AC", "Vegetarian Kitchen", "24x7 Reception"));
        h3.put("checkIn", "12:00 PM"); h3.put("checkOut", "11:00 AM");
        hotels.add(h3);

        Map<String, Object> h4 = new HashMap<>();
        h4.put("name", "OYO Rooms"); h4.put("rating", 3.8); h4.put("price", 1500);
        h4.put("priceCategory", "Budget"); h4.put("vicinity", "Bus Stand Area");
        h4.put("nearDescription", "~3.0 km from " + near);
        h4.put("amenities", List.of("Free WiFi", "AC", "Ground Floor Available", "Jain Food Available"));
        h4.put("checkIn", "12:00 PM"); h4.put("checkOut", "11:00 AM");
        hotels.add(h4);

        if (maxPrice != null && maxPrice > 0) {
            return hotels.stream()
                    .filter(h -> ((Number) h.get("price")).doubleValue() <= maxPrice)
                    .toList();
        }
        return hotels;
    }
}
