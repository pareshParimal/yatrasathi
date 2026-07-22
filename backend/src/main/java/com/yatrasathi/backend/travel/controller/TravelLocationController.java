package com.yatrasathi.backend.travel.controller;

import com.yatrasathi.backend.common.dto.ApiResponse;
import com.yatrasathi.backend.location.telegram.TelegramBotService;
import com.yatrasathi.backend.travel.dto.LocationUpdateRequest;
import com.yatrasathi.backend.travel.entity.TravelPlan;
import com.yatrasathi.backend.travel.repository.TravelPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/travel-plans")
@RequiredArgsConstructor
@Slf4j
public class TravelLocationController {

    private final TravelPlanRepository travelPlanRepository;
    private final TelegramBotService telegramBotService;
    private final com.yatrasathi.backend.location.repository.LocationContactRepository contactRepository;

    @PostMapping("/{planId}/location")
    public ResponseEntity<ApiResponse<String>> updateLocation(
            @PathVariable UUID planId,
            @RequestBody LocationUpdateRequest request,
            @RequestHeader("X-User-Id") UUID userId) {

        TravelPlan plan = travelPlanRepository.findById(planId).orElseThrow();

        // Check if this plan belongs to the user
        if (!plan.getUser().getId().equals(userId)) {
            return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized"));
        }

        // Check if consent is given
        if (!Boolean.TRUE.equals(plan.getShareLocationTelegram())) {
            return ResponseEntity.ok(ApiResponse.success("Location logged (no Telegram sharing enabled)."));
        }

        // Check time interval
        LocalDateTime now = LocalDateTime.now();
        if (plan.getLastLocationSharedAt() != null && plan.getLocationShareIntervalHours() != null) {
            LocalDateTime nextShareTime = plan.getLastLocationSharedAt().plusHours(plan.getLocationShareIntervalHours());
            if (now.isBefore(nextShareTime)) {
                return ResponseEntity.ok(ApiResponse.success("Location logged. Next Telegram share at " + nextShareTime));
            }
        }

        // Trigger Telegram update
        String destName = plan.getDestination() != null ? plan.getDestination().getName() : "Unknown destination";
        
        java.util.List<com.yatrasathi.backend.location.entity.LocationSharingContact> contacts = 
                contactRepository.findByUserIdAndIsActiveTrue(userId);
        
        java.util.List<String> chatIds = contacts.stream()
                .map(com.yatrasathi.backend.location.entity.LocationSharingContact::getTelegramChatId)
                .collect(java.util.stream.Collectors.toList());

        telegramBotService.sendLocationUpdate(
                chatIds,
                plan.getUser().getFullName(),
                destName,
                request.getLatitude(),
                request.getLongitude(),
                plan.getSpecialRequirements()
        );

        plan.setLastLocationSharedAt(now);
        travelPlanRepository.save(plan);

        return ResponseEntity.ok(ApiResponse.success("Location logged and shared to Telegram successfully."));
    }
}
