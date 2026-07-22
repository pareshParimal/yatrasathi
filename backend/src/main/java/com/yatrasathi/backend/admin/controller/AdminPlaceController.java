package com.yatrasathi.backend.admin.controller;

import com.yatrasathi.backend.admin.dto.AdminPlaceRequest;
import com.yatrasathi.backend.admin.service.AdminPlaceService;
import com.yatrasathi.backend.common.dto.ApiResponse;
import com.yatrasathi.backend.place.entity.Place;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/places")
@RequiredArgsConstructor
public class AdminPlaceController {

    private final AdminPlaceService adminPlaceService;

    @PostMapping
    public ResponseEntity<ApiResponse<Place>> createPlace(@RequestBody AdminPlaceRequest request) {
        Place place = adminPlaceService.createPlace(request);
        return ResponseEntity.ok(ApiResponse.success(place));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Place>> updatePlace(@PathVariable UUID id, @RequestBody AdminPlaceRequest request) {
        Place place = adminPlaceService.updatePlace(id, request);
        return ResponseEntity.ok(ApiResponse.success(place));
    }
}
