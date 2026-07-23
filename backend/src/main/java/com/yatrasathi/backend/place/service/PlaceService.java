package com.yatrasathi.backend.place.service;

import com.yatrasathi.backend.place.entity.Place;
import com.yatrasathi.backend.place.entity.PlaceContent;
import com.yatrasathi.backend.place.repository.PlaceContentRepository;
import com.yatrasathi.backend.place.repository.PlaceRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class PlaceService {

    private final PlaceRepository placeRepository;
    private final PlaceContentRepository placeContentRepository;
    private final org.springframework.web.reactive.function.client.WebClient webClient;
    private final com.yatrasathi.backend.chat.service.GeminiService geminiService;

    @Autowired
    public PlaceService(PlaceRepository placeRepository, 
                        PlaceContentRepository placeContentRepository,
                        org.springframework.web.reactive.function.client.WebClient.Builder webClientBuilder,
                        com.yatrasathi.backend.chat.service.GeminiService geminiService) {
        this.placeRepository = placeRepository;
        this.placeContentRepository = placeContentRepository;
        this.webClient = webClientBuilder.baseUrl("https://api.open-meteo.com").build();
        this.geminiService = geminiService;
    }

    public List<Place> getAllPublishedPlaces() {
        return placeRepository.findByStatus("PUBLISHED");
    }

    public Place getPlaceById(UUID id) {
        return placeRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Place not found"));
    }

    public List<PlaceContent> getPlaceContent(UUID placeId, String contentType) {
        List<PlaceContent> contents;
        if (contentType == null) {
            contents = placeContentRepository.findByPlaceIdAndStatusOrderBySortOrderAsc(placeId, "PUBLISHED");
        } else {
            contents = placeContentRepository.findByPlaceIdAndContentTypeAndStatusOrderBySortOrderAsc(placeId, contentType, "PUBLISHED");
        }
        
        // If no content is found, dynamically generate it using Gemini
        if (contents == null || contents.isEmpty()) {
            Place place = getPlaceById(placeId);
            PlaceContent dynamicContent = new PlaceContent();
            dynamicContent.setPlace(place);
            dynamicContent.setContentType(contentType != null ? contentType : "OVERVIEW");
            dynamicContent.setTitle(place.getName() + " - Overview");
            dynamicContent.setStatus("PUBLISHED");
            dynamicContent.setSortOrder(1);

            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.node.ObjectNode jsonNode = mapper.createObjectNode();

            String prompt = "Generate a short JSON object containing a historical summary (2 sentences) and a cultural summary (2 sentences) for the place: " 
                            + place.getName() + ", " + place.getState() + ". "
                            + "Return ONLY raw JSON with keys 'historicalText' and 'culturalText' and no markdown formatting.";
            try {
                String aiResponse = geminiService.generateContent(prompt).block();
                if (aiResponse != null && !aiResponse.isEmpty() && !aiResponse.contains("Sorry")) {
                    aiResponse = aiResponse.replaceAll("```json", "").replaceAll("```", "").trim();
                    java.util.Map<String, String> result = mapper.readValue(aiResponse, java.util.Map.class);
                    jsonNode.put("historicalText", result.get("historicalText"));
                    jsonNode.put("culturalText", result.get("culturalText"));
                    dynamicContent.setSource("AI_GENERATED");
                } else {
                    throw new RuntimeException("AI Response was empty or contained an error.");
                }
            } catch (Exception e) {
                log.warn("Gemini API failed for {}, falling back to Wikipedia", place.getName());
                // Fallback to Wikipedia API
                try {
                    String wikiUrl = "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=" + place.getName().replace(" ", "%20");
                    org.springframework.web.reactive.function.client.WebClient wikiClient = org.springframework.web.reactive.function.client.WebClient.create();
                    String wikiResponse = wikiClient.get().uri(wikiUrl).retrieve().bodyToMono(String.class).block();
                    
                    com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(wikiResponse);
                    com.fasterxml.jackson.databind.JsonNode pages = root.path("query").path("pages");
                    
                    String extract = "Historical information could not be retrieved at this time.";
                    if (pages.isObject() && pages.fields().hasNext()) {
                        extract = pages.fields().next().getValue().path("extract").asText();
                    }
                    
                    // Split the extract roughly into history and culture if it's long enough
                    int midPoint = extract.length() / 2;
                    int splitIndex = extract.indexOf(". ", midPoint);
                    if (splitIndex != -1 && splitIndex < extract.length() - 2) {
                        jsonNode.put("historicalText", extract.substring(0, splitIndex + 1).trim());
                        jsonNode.put("culturalText", extract.substring(splitIndex + 2).trim());
                    } else {
                        jsonNode.put("historicalText", extract);
                        jsonNode.put("culturalText", "Further cultural insights are available through local guides.");
                    }
                    dynamicContent.setSource("WIKIPEDIA_FALLBACK");
                } catch (Exception ex) {
                    log.error("Wikipedia fallback also failed", ex);
                    jsonNode.put("historicalText", "We are currently experiencing issues fetching storytelling content.");
                    jsonNode.put("culturalText", "Please try again later or consult a local guide.");
                    dynamicContent.setSource("SYSTEM_FALLBACK");
                }
            }
            
            dynamicContent.setContent(jsonNode);
            // Cache it in the database
            placeContentRepository.save(dynamicContent);
            return List.of(dynamicContent);
        }
        return contents;
    }
}
