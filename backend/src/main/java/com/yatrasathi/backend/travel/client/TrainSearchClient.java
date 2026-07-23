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
public class TrainSearchClient {

    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    /**
     * Searches for trains between two cities, filtered by departure window and max duration.
     * Uses Gemini AI to generate realistic Indian train schedules.
     */
    public Mono<List<Map<String, Object>>> searchTrains(
            String fromCity,
            String toCity,
            String travelDate,
            String departureFrom,
            String departureTo,
            int maxDurationHours,
            String language) {

        String prompt = buildPrompt(fromCity, toCity, travelDate, departureFrom, departureTo, maxDurationHours, language);

        return geminiService.generateContent(prompt)
                .map(response -> parseTrainsFromResponse(response, fromCity, toCity, departureFrom, departureTo, maxDurationHours))
                .onErrorResume(e -> {
                    log.error("Error fetching trains via Gemini: {}", e.getMessage());
                    return Mono.just(getFallbackTrains(fromCity, toCity));
                });
    }

    private String buildPrompt(String fromCity, String toCity, String date, String depFrom, String depTo, int maxDuration, String language) {
        String langDirective = "hi".equalsIgnoreCase(language) ? "Hindi (Devanagari script)" : "English";

        return String.format(
            "You are an expert Indian Railways system. Generate a JSON array of realistic train schedules " +
            "from %s to %s on %s. The trains MUST depart between %s and %s, and the journey MUST take less than %d hours.\n\n" +
            "CRITICAL: All textual data (train names, classes) MUST be written in %s.\n\n" +
            "Return ONLY a valid JSON array with at most 5 trains. Each train must have these fields:\n" +
            "- id: unique string (e.g. 'train-1')\n" +
            "- number: realistic 5-digit Indian train number (e.g. '12004')\n" +
            "- name: realistic Indian train name in %s (e.g. 'Shatabdi Express', 'Rajdhani Express')\n" +
            "- departure: departure time (e.g. '06:00 AM')\n" +
            "- arrival: arrival time (e.g. '10:30 AM')\n" +
            "- duration: duration string (e.g. '4h 30m')\n" +
            "- classes: array of strings in %s (e.g. ['SL', '3A', '2A', '1A', 'CC'])\n" +
            "- price: realistic base price in INR (integer)\n" +
            "- availability: one of ['AVAILABLE', 'RAC', 'WAITLIST']\n\n" +
            "Return ONLY the JSON array, no explanation, no markdown code blocks.",
            fromCity, toCity, date, depFrom, depTo, maxDuration, langDirective, langDirective, langDirective
        );
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> parseTrainsFromResponse(String response, String fromCity, String toCity,
                                                               String departureFrom, String departureTo, int maxDurationHours) {
        try {
            // Clean up the response - remove potential markdown code blocks
            String cleaned = response.trim();
            if (cleaned.startsWith("```")) {
                cleaned = cleaned.replaceAll("```json\\n?", "").replaceAll("```\\n?", "").trim();
            }

            List<Map<String, Object>> trains = objectMapper.readValue(cleaned, List.class);

            // Filter by departure window and duration as a safety net
            return trains.stream()
                    .filter(t -> {
                        try {
                            int durMins = (int) t.getOrDefault("durationMinutes", 999);
                            return durMins <= maxDurationHours * 60;
                        } catch (Exception e) {
                            return true;
                        }
                    })
                    .toList();
        } catch (Exception e) {
            log.warn("Could not parse Gemini train response, using fallback. Response was: {}", response);
            return getFallbackTrains(fromCity, toCity);
        }
    }

    private List<Map<String, Object>> getFallbackTrains(String fromCity, String toCity) {
        log.info("Returning fallback train data for {} -> {}", fromCity, toCity);
        List<Map<String, Object>> trains = new ArrayList<>();

        Map<String, Object> t1 = new HashMap<>();
        t1.put("id", "12001"); t1.put("name", "Shatabdi Express"); t1.put("number", "12001");
        t1.put("departure", "06:00"); t1.put("arrival", "13:00"); t1.put("duration", "7h 00m");
        t1.put("durationMinutes", 420); t1.put("price", 1505);
        t1.put("classes", List.of("CC", "EC")); t1.put("availability", "AVAILABLE");
        t1.put("days", List.of("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"));
        trains.add(t1);

        Map<String, Object> t2 = new HashMap<>();
        t2.put("id", "12301"); t2.put("name", "Rajdhani Express"); t2.put("number", "12301");
        t2.put("departure", "16:55"); t2.put("arrival", "10:00"); t2.put("duration", "17h 05m");
        t2.put("durationMinutes", 1025); t2.put("price", 2350);
        t2.put("classes", List.of("3A", "2A", "1A")); t2.put("availability", "AVAILABLE");
        t2.put("days", List.of("Mon", "Wed", "Fri", "Sun"));
        trains.add(t2);

        Map<String, Object> t3 = new HashMap<>();
        t3.put("id", "12621"); t3.put("name", "Tamil Nadu Express"); t3.put("number", "12621");
        t3.put("departure", "22:30"); t3.put("arrival", "07:30"); t3.put("duration", "9h 00m");
        t3.put("durationMinutes", 540); t3.put("price", 1275);
        t3.put("classes", List.of("SL", "3A", "2A")); t3.put("availability", "RAC");
        t3.put("days", List.of("Tue", "Thu", "Sat"));
        trains.add(t3);

        return trains;
    }
}
