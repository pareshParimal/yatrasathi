package com.yatrasathi.backend.place.controller;

import com.yatrasathi.backend.common.dto.ApiResponse;
import com.yatrasathi.backend.place.entity.Place;
import com.yatrasathi.backend.place.entity.PlaceContent;
import com.yatrasathi.backend.place.service.PlaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/places")
@RequiredArgsConstructor
public class PlaceController {

    private final PlaceService placeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Place>>> getAllPlaces() {
        return ResponseEntity.ok(ApiResponse.success(placeService.getAllPublishedPlaces()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Place>> getPlaceById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(placeService.getPlaceById(id)));
    }

    @GetMapping("/{id}/content")
    public ResponseEntity<ApiResponse<List<PlaceContent>>> getPlaceContent(
            @PathVariable UUID id,
            @RequestParam(required = false) String type
    ) {
        return ResponseEntity.ok(ApiResponse.success(placeService.getPlaceContent(id, type)));
    }
}
