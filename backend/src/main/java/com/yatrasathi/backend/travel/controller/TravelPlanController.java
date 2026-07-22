package com.yatrasathi.backend.travel.controller;

import com.yatrasathi.backend.common.dto.ApiResponse;
import com.yatrasathi.backend.travel.dto.TravelPlanRequest;
import com.yatrasathi.backend.travel.entity.TravelPlan;
import com.yatrasathi.backend.travel.service.TravelPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/travel-plans")
@RequiredArgsConstructor
public class TravelPlanController {

    private final TravelPlanService travelPlanService;

    @PostMapping
    public ResponseEntity<ApiResponse<TravelPlan>> createPlan(
            @RequestBody TravelPlanRequest request,
            @RequestHeader("X-User-Id") UUID userId
    ) {
        return ResponseEntity.ok(ApiResponse.success(travelPlanService.createPlan(request, userId)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TravelPlan>>> getUserPlans(@RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(ApiResponse.success(travelPlanService.getUserPlans(userId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TravelPlan>> getPlan(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(travelPlanService.getPlan(id)));
    }

    @PostMapping("/{id}/itinerary/generate")
    public ResponseEntity<ApiResponse<String>> generateItinerary(@PathVariable UUID id) {
        travelPlanService.generateItinerary(id);
        return ResponseEntity.ok(ApiResponse.success("Itinerary generated successfully"));
    }

    @GetMapping("/{id}/hotels")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getNearbyHotels(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(travelPlanService.getNearbyHotelsForPlan(id)));
    }
}
