package com.yatrasathi.backend.travel.service;

import com.yatrasathi.backend.place.entity.Place;
import com.yatrasathi.backend.place.repository.PlaceRepository;
import com.yatrasathi.backend.travel.client.HotelSearchClient;
import com.yatrasathi.backend.travel.client.MapsClient;
import com.yatrasathi.backend.travel.client.TrainSearchClient;
import com.yatrasathi.backend.travel.entity.TravelPlan;
import com.yatrasathi.backend.travel.repository.TravelPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.Cacheable;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final TravelPlanRepository travelPlanRepository;
    private final TrainSearchClient trainSearchClient;
    private final HotelSearchClient hotelSearchClient;
    private final MapsClient mapsClient;
    private final PlaceRepository placeRepository;

    /**
     * Search for real trains between two cities with user-defined filters.
     */
    @Cacheable(value = "trains", key = "{#fromCity, #toCity, #travelDate, #departureFrom, #departureTo, #maxDurationHours, #language}", unless = "#result == null or #result.isEmpty() or #result[0].get('isFallback') == true")
    public List<Map<String, Object>> searchTrains(
            String fromCity,
            String toCity,
            String travelDate,
            String departureFrom,
            String departureTo,
            int maxDurationHours,
            String language) {

        if (fromCity == null || fromCity.isBlank()) fromCity = "Delhi";
        if (toCity == null || toCity.isBlank()) toCity = "Agra";
        if (departureFrom == null || departureFrom.isBlank()) departureFrom = "00:00";
        if (departureTo == null || departureTo.isBlank()) departureTo = "23:59";
        if (maxDurationHours <= 0) maxDurationHours = 24;

        final String finalFrom = fromCity;
        final String finalTo = toCity;
        final String finalDate = travelDate != null ? travelDate : "2025-08-15";
        final String finalDepFrom = departureFrom;
        final String finalDepTo = departureTo;
        final int finalMaxDur = maxDurationHours;

        return trainSearchClient.searchTrains(finalFrom, finalTo, finalDate, finalDepFrom, finalDepTo, finalMaxDur, language)
                .block();
    }

    /**
     * Search for hotels near a destination. If a specific landmark lat/lng is provided, use that.
     * Otherwise fall back to destination center coordinates.
     */
    @Cacheable(value = "hotels", key = "{#destinationId, #landmarkLat, #landmarkLng, #landmarkName, #maxPricePerNight, #radiusKm, #language}")
    public List<Map<String, Object>> searchHotels(
            UUID destinationId,
            Double landmarkLat,
            Double landmarkLng,
            String landmarkName,
            Double maxPricePerNight,
            Double radiusKm,
            String language) {

        if (radiusKm == null || radiusKm <= 0) radiusKm = 5.0;

        // Resolve destination city name and landmark
        String destinationCity = "Destination";
        String nearLandmark = landmarkName;

        if (destinationId != null) {
            Optional<Place> placeOpt = placeRepository.findById(destinationId);
            if (placeOpt.isPresent()) {
                destinationCity = placeOpt.get().getName();
                if (nearLandmark == null || nearLandmark.isBlank()) {
                    nearLandmark = placeOpt.get().getName();
                }
            }
        }

        log.info("Searching hotels in {} near {} via Gemini", destinationCity, nearLandmark);
        return hotelSearchClient.searchHotels(destinationCity, nearLandmark, maxPricePerNight, radiusKm, language).block();
    }

    private List<Map<String, Object>> getEnhancedMockHotels(String nearDescription, Double maxPrice) {
        List<Map<String, Object>> all = new ArrayList<>();
        all.add(Map.of("name", "Taj Hotel & Convention Centre", "rating", 4.8, "price", 9500,
                "priceCategory", "Luxury", "vicinity", "City Center",
                "nearDescription", "0.8 km from " + nearDescription,
                "amenities", List.of("Free WiFi", "AC", "Lift", "Vegetarian Kitchen", "Medical Assistance")));
        all.add(Map.of("name", "Lemon Tree Premier", "rating", 4.2, "price", 4800,
                "priceCategory", "Mid-range", "vicinity", "Near Station",
                "nearDescription", "1.5 km from " + nearDescription,
                "amenities", List.of("Free WiFi", "AC", "Lift", "Multi-cuisine", "Wheelchair Accessible")));
        all.add(Map.of("name", "OYO Heritage Inn", "rating", 4.0, "price", 2200,
                "priceCategory", "Budget", "vicinity", "Market Area",
                "nearDescription", "2.1 km from " + nearDescription,
                "amenities", List.of("Free WiFi", "AC", "Ground Floor Available", "Vegetarian Kitchen")));
        all.add(Map.of("name", "Comfort Residency", "rating", 3.8, "price", 1800,
                "priceCategory", "Budget", "vicinity", "Bus Stand Area",
                "nearDescription", "3.0 km from " + nearDescription,
                "amenities", List.of("Free WiFi", "Fan Rooms", "Ground Floor Available", "Jain Food Available")));

        if (maxPrice != null && maxPrice > 0) {
            return all.stream().filter(h -> ((Number) h.get("price")).doubleValue() <= maxPrice).toList();
        }
        return all;
    }

    /**
     * Legacy method kept for backward compatibility.
     */
    public Map<String, Object> getMockBookingOptions(UUID destinationId, Double budgetMax) {
        List<Map<String, Object>> trains = searchTrains("Delhi", "Destination", null, "00:00", "23:59", 24, "hi");
        List<Map<String, Object>> hotels = searchHotels(destinationId, null, null, null, budgetMax, 5.0, "hi");
        return Map.of("trains", trains, "hotels", hotels);
    }

    @Transactional
    public TravelPlan confirmBooking(UUID planId, String trainName, String hotelName) {
        TravelPlan plan = travelPlanRepository.findById(planId)
            .orElseThrow(() -> new RuntimeException("Travel Plan not found"));

        plan.setBookedTrainName(trainName);
        plan.setBookedHotelName(hotelName);
        plan.setBookingStatus("CONFIRMED");

        // Use hardcoded PNR provided by user
        String pnrNumber = "2159351649";
        plan.setPnrNumber(pnrNumber);

        return travelPlanRepository.save(plan);
    }
}
