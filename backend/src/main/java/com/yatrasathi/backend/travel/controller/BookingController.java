package com.yatrasathi.backend.travel.controller;

import com.yatrasathi.backend.common.dto.ApiResponse;
import com.yatrasathi.backend.travel.entity.TravelPlan;
import com.yatrasathi.backend.travel.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    /**
     * Legacy endpoint — returns both trains and hotels for backward compatibility.
     */
    @GetMapping("/options")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOptions(
            @RequestParam UUID destinationId,
            @RequestParam(required = false) Double budgetMax) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getMockBookingOptions(destinationId, budgetMax)));
    }

    /**
     * New endpoint: Search for trains with user-defined filters.
     * Query params:
     *   fromCity        - source city name (e.g. "Delhi")
     *   toCity          - destination city name (e.g. "Agra")
     *   travelDate      - date in YYYY-MM-DD format
     *   departureFrom   - earliest departure time in HH:MM (e.g. "05:00")
     *   departureTo     - latest departure time in HH:MM (e.g. "20:00")
     *   maxDurationHours- maximum journey duration in hours (e.g. 12)
     */
    @GetMapping("/trains")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> searchTrains(
            @RequestParam(required = false, defaultValue = "Delhi") String fromCity,
            @RequestParam(required = false, defaultValue = "Agra") String toCity,
            @RequestParam(required = false) String travelDate,
            @RequestParam(required = false, defaultValue = "00:00") String departureFrom,
            @RequestParam(required = false, defaultValue = "23:59") String departureTo,
            @RequestParam(required = false, defaultValue = "24") int maxDurationHours,
            @RequestHeader(value = "x-user-language", defaultValue = "hi") String language) {

        List<Map<String, Object>> trains = bookingService.searchTrains(
                fromCity, toCity, travelDate, departureFrom, departureTo, maxDurationHours, language);
        return ResponseEntity.ok(ApiResponse.success(trains));
    }

    /**
     * New endpoint: Search for hotels near a destination or landmark.
     * Query params:
     *   destinationId   - UUID of the destination place (required if landmarkLat/Lng not provided)
     *   landmarkLat     - latitude of a specific landmark for proximity search
     *   landmarkLng     - longitude of a specific landmark
     *   landmarkName    - display name of the landmark (for display only)
     *   maxPricePerNight- maximum price per night filter in INR
     *   radiusKm        - search radius in km (default 5.0)
     */
    @GetMapping("/hotels")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> searchHotels(
            @RequestParam(required = false) UUID destinationId,
            @RequestParam(required = false) Double landmarkLat,
            @RequestParam(required = false) Double landmarkLng,
            @RequestParam(required = false) String landmarkName,
            @RequestParam(required = false) Double maxPricePerNight,
            @RequestParam(required = false, defaultValue = "5.0") Double radiusKm,
            @RequestHeader(value = "x-user-language", defaultValue = "hi") String language) {

        List<Map<String, Object>> hotels = bookingService.searchHotels(
                destinationId, landmarkLat, landmarkLng, landmarkName, maxPricePerNight, radiusKm, language);
        return ResponseEntity.ok(ApiResponse.success(hotels));
    }

    /**
     * Confirm a booking for a plan (booking stays mock, generates a random PNR).
     */
    @PostMapping("/confirm/{planId}")
    public ResponseEntity<ApiResponse<TravelPlan>> confirmBooking(
            @PathVariable UUID planId,
            @RequestBody Map<String, String> request) {
        String trainName = request.get("trainName");
        String hotelName = request.get("hotelName");
        TravelPlan plan = bookingService.confirmBooking(planId, trainName, hotelName);
        return ResponseEntity.ok(ApiResponse.success(plan));
    }
}
