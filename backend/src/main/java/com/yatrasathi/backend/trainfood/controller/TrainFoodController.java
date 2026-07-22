package com.yatrasathi.backend.trainfood.controller;

import com.yatrasathi.backend.common.dto.ApiResponse;
import com.yatrasathi.backend.trainfood.entity.TrainFoodPlatform;
import com.yatrasathi.backend.trainfood.repository.TrainFoodPlatformRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/train-food/platforms")
@RequiredArgsConstructor
public class TrainFoodController {

    private final TrainFoodPlatformRepository repository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TrainFoodPlatform>>> getAllPlatforms() {
        return ResponseEntity.ok(ApiResponse.success(repository.findByIsActiveTrue()));
    }
}
