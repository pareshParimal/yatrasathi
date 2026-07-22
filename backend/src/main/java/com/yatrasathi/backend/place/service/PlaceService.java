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
            String prompt = "Generate a short JSON object containing a historical summary (2 sentences) and a cultural summary (2 sentences) for the place: " 
                            + place.getName() + ", " + place.getState() + ". "
                            + "Return ONLY raw JSON with keys 'historicalText' and 'culturalText' and no markdown formatting.";
            try {
                String aiResponse = geminiService.generateContent(prompt).block();
                if (aiResponse != null) {
                    aiResponse = aiResponse.replaceAll("```json", "").replaceAll("```", "").trim();
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    java.util.Map<String, String> result = mapper.readValue(aiResponse, java.util.Map.class);
                    
                    PlaceContent dynamicContent = new PlaceContent();
                    dynamicContent.setTitle(place.getName() + " - Overview");
                    
                    com.fasterxml.jackson.databind.node.ObjectNode jsonNode = mapper.createObjectNode();
                    jsonNode.put("historicalText", result.get("historicalText"));
                    jsonNode.put("culturalText", result.get("culturalText"));
                    dynamicContent.setContent(jsonNode);
                    
                    return List.of(dynamicContent);
                }
            } catch (Exception e) {
                // Fallback to empty if Gemini fails
            }
        }
        return contents;
    }
}
