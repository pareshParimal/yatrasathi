package com.yatrasathi.backend.location.controller;

import com.yatrasathi.backend.common.dto.ApiResponse;
import com.yatrasathi.backend.location.dto.LocationUpdateRequest;
import com.yatrasathi.backend.location.service.LocationSharingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/location")
@RequiredArgsConstructor
public class LocationController {

    private final LocationSharingService locationSharingService;

    @PostMapping("/update")
    public ResponseEntity<ApiResponse<Void>> updateLocation(
            @RequestBody LocationUpdateRequest request,
            @RequestHeader("X-User-Id") UUID userId
    ) {
        locationSharingService.updateLocation(userId, request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
