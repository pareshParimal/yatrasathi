package com.yatrasathi.backend.travel.service;

import com.yatrasathi.backend.auth.entity.User;
import com.yatrasathi.backend.auth.repository.UserRepository;
import com.yatrasathi.backend.chat.service.GeminiService;
import com.yatrasathi.backend.place.entity.Place;
import com.yatrasathi.backend.place.repository.PlaceRepository;
import com.yatrasathi.backend.travel.client.MapsClient;
import com.yatrasathi.backend.travel.dto.TravelPlanRequest;
import com.yatrasathi.backend.travel.entity.PlanItineraryItem;
import com.yatrasathi.backend.travel.entity.TravelPlan;
import com.yatrasathi.backend.travel.repository.PlanItineraryItemRepository;
import com.yatrasathi.backend.travel.repository.TravelPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TravelPlanService {

    private final TravelPlanRepository travelPlanRepository;
    private final PlanItineraryItemRepository itineraryItemRepository;
    private final UserRepository userRepository;
    private final PlaceRepository placeRepository;
    private final GeminiService geminiService;
    private final MapsClient mapsClient;

    public TravelPlan createPlan(TravelPlanRequest request, UUID userId) {
        User user = userRepository.findById(userId).orElseThrow();
        Place place = request.getDestinationId() != null ? placeRepository.findById(request.getDestinationId()).orElse(null) : null;

        TravelPlan plan = TravelPlan.builder()
                .user(user)
                .title(request.getTitle() != null ? request.getTitle() : "Trip from " + (request.getSourceLocation() != null ? request.getSourceLocation() : "Unknown") + " to " + (place != null ? place.getName() : "Unknown"))
                .sourceLocation(request.getSourceLocation())
                .destination(place)
                .travelMedium(request.getTravelMedium())
                .boardingTimePref(request.getBoardingTimePref())
                .deboardingTimePref(request.getDeboardingTimePref())
                .travelDurationPref(request.getTravelDurationPref())
                .hotelMaxDistanceKm(request.getHotelMaxDistanceKm())
                .budgetMin(request.getBudgetMin())
                .budgetMax(request.getBudgetMax())
                .foodPreference(request.getFoodPreference())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .numTravellers(request.getNumTravellers() != null ? request.getNumTravellers() : 1)
                .specialRequirements(request.getSpecialRequirements())
                .shareLocationTelegram(request.getShareLocationTelegram() != null ? request.getShareLocationTelegram() : false)
                .locationShareIntervalHours(request.getLocationShareIntervalHours())
                .status("PLANNED")
                .build();

        return travelPlanRepository.save(plan);
    }

    public List<TravelPlan> getUserPlans(UUID userId) {
        return travelPlanRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public TravelPlan getPlan(UUID planId) {
        return travelPlanRepository.findById(planId).orElseThrow();
    }

    public List<Map<String, Object>> getNearbyHotelsForPlan(UUID planId) {
        TravelPlan plan = getPlan(planId);
        if (plan.getDestination() == null) {
            throw new IllegalArgumentException("Plan has no destination");
        }
        Double radius = plan.getHotelMaxDistanceKm() != null ? plan.getHotelMaxDistanceKm() : 5.0;
        return mapsClient.getNearbyHotels(
                plan.getDestination().getLatitude(), 
                plan.getDestination().getLongitude(), 
                radius
        ).block();
    }

    public void generateItinerary(UUID planId) {
        TravelPlan plan = getPlan(planId);
        if (plan.getDestination() == null) {
            throw new IllegalArgumentException("Plan has no destination");
        }

        String prompt = String.format(
                "Generate a 2-day travel itinerary for an elderly person visiting %s, India. " +
                "Budget range: %s to %s INR. Food preference: %s. " +
                "Special requirements: %s. Keep the pace slow and suitable for seniors. " +
                "Respond strictly in this format for each day:\n" +
                "Day 1: [Morning Activity], [Afternoon Activity], [Evening Activity]\n" +
                "Day 2: ...",
                plan.getDestination().getName(),
                plan.getBudgetMin(), plan.getBudgetMax(),
                plan.getFoodPreference(),
                plan.getSpecialRequirements()
        );

        String aiResponse = geminiService.generateContent(prompt).block();
        
        // Very basic parsing for MVP (assumes AI follows the prompt format somewhat)
        String[] days = aiResponse.split("Day ");
        for (int i = 1; i < days.length; i++) {
            String dayContent = days[i];
            PlanItineraryItem item = PlanItineraryItem.builder()
                    .plan(plan)
                    .dayNumber(i)
                    .activity("Activities: " + dayContent.trim())
                    .timeSlot(LocalTime.of(9, 0)) // Default to morning start
                    .build();
            itineraryItemRepository.save(item);
        }
    }
}
