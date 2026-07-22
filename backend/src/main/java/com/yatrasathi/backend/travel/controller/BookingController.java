package com.yatrasathi.backend.travel.controller;

import com.yatrasathi.backend.common.dto.ApiResponse;
import com.yatrasathi.backend.travel.entity.TravelPlan;
import com.yatrasathi.backend.travel.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @GetMapping("/options")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOptions(
            @RequestParam UUID destinationId,
            @RequestParam(required = false) Double budgetMax) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getMockBookingOptions(destinationId, budgetMax)));
    }

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
