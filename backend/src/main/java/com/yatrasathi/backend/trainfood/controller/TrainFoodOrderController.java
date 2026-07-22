package com.yatrasathi.backend.trainfood.controller;

import com.yatrasathi.backend.common.dto.ApiResponse;
import com.yatrasathi.backend.trainfood.service.TrainFoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/food")
@RequiredArgsConstructor
public class TrainFoodOrderController {

    private final TrainFoodService trainFoodService;

    @GetMapping("/pnr/{pnr}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFoodOptionsByPnr(@PathVariable String pnr) {
        return ResponseEntity.ok(ApiResponse.success(trainFoodService.getStationsByPnr(pnr)));
    }

    @PostMapping("/order")
    public ResponseEntity<ApiResponse<Map<String, Object>>> placeOrder(
            @RequestBody Map<String, Object> payload,
            @RequestParam(required = false) java.util.UUID planId) {
        return ResponseEntity.ok(ApiResponse.success(trainFoodService.placeOrder(payload, planId)));
    }
}
