package com.yatrasathi.backend.location.controller;

import com.yatrasathi.backend.common.dto.ApiResponse;
import com.yatrasathi.backend.location.dto.LocationContactRequest;
import com.yatrasathi.backend.location.dto.LocationContactResponse;
import com.yatrasathi.backend.location.dto.LocationUpdateRequest;
import com.yatrasathi.backend.location.service.LocationSharingService;
import com.yatrasathi.backend.location.telegram.TelegramBotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/location")
@RequiredArgsConstructor
public class LocationController {

    private final LocationSharingService locationSharingService;
    private final TelegramBotService telegramBotService;

    @PostMapping("/update")
    public ResponseEntity<ApiResponse<Void>> updateLocation(
            @RequestBody LocationUpdateRequest request,
            @RequestHeader("X-User-Id") UUID userId
    ) {
        locationSharingService.updateLocation(userId, request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // --- Emergency Contacts CRUD ---

    @GetMapping("/contacts")
    public ResponseEntity<ApiResponse<List<LocationContactResponse>>> getContacts(
            @RequestHeader("X-User-Id") UUID userId
    ) {
        return ResponseEntity.ok(ApiResponse.success(locationSharingService.getContacts(userId)));
    }

    @PostMapping("/contacts")
    public ResponseEntity<ApiResponse<LocationContactResponse>> addContact(
            @RequestBody LocationContactRequest request,
            @RequestHeader("X-User-Id") UUID userId
    ) {
        return ResponseEntity.ok(ApiResponse.success(locationSharingService.addContact(userId, request)));
    }

    @DeleteMapping("/contacts/{contactId}")
    public ResponseEntity<ApiResponse<String>> deleteContact(
            @PathVariable UUID contactId,
            @RequestHeader("X-User-Id") UUID userId
    ) {
        locationSharingService.deleteContact(userId, contactId);
        return ResponseEntity.ok(ApiResponse.success("Contact removed."));
    }

    // --- Telegram Bot Users (for picking a contact) ---

    @GetMapping("/telegram-users")
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> getTelegramUsers() {
        List<Map<String, String>> users = telegramBotService.getRecentUsers().block();
        return ResponseEntity.ok(ApiResponse.success(users));
    }
}
