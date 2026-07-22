package com.yatrasathi.backend.travel.service;

import com.yatrasathi.backend.travel.entity.TravelPlan;
import com.yatrasathi.backend.travel.repository.TravelPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final TravelPlanRepository travelPlanRepository;

    public Map<String, Object> getMockBookingOptions(UUID destinationId, Double budgetMax) {
        // Mock Trains
        List<Map<String, Object>> trains = List.of(
            Map.of("id", "T1", "name", "Vande Bharat Express", "type", "Train", "price", 1500, "departure", "06:00 AM", "arrival", "02:00 PM", "duration", "8h"),
            Map.of("id", "T2", "name", "Shatabdi Express", "type", "Train", "price", 1200, "departure", "04:30 PM", "arrival", "11:30 PM", "duration", "7h"),
            Map.of("id", "T3", "name", "Rajdhani Express", "type", "Train", "price", 2200, "departure", "08:00 PM", "arrival", "08:00 AM", "duration", "12h")
        );

        // Mock Hotels
        List<Map<String, Object>> hotels = List.of(
            Map.of("id", "H1", "name", "Taj Palace", "type", "Hotel", "price", 8000, "rating", 4.8, "distance", "2.5 km from station"),
            Map.of("id", "H2", "name", "Lemon Tree Premier", "type", "Hotel", "price", 4500, "rating", 4.2, "distance", "1.2 km from station"),
            Map.of("id", "H3", "name", "Comfort Inn", "type", "Hotel", "price", 2000, "rating", 3.8, "distance", "0.5 km from station")
        );

        return Map.of("trains", trains, "hotels", hotels);
    }

    @Transactional
    public TravelPlan confirmBooking(UUID planId, String trainName, String hotelName) {
        TravelPlan plan = travelPlanRepository.findById(planId)
            .orElseThrow(() -> new RuntimeException("Travel Plan not found"));

        plan.setBookedTrainName(trainName);
        plan.setBookedHotelName(hotelName);
        plan.setBookingStatus("CONFIRMED");
        
        // Generate a 10 digit mock PNR
        Random rnd = new Random();
        long pnrNumber = 1000000000L + (long)(rnd.nextDouble() * 8999999999L);
        plan.setPnrNumber(String.valueOf(pnrNumber));

        return travelPlanRepository.save(plan);
    }
}
