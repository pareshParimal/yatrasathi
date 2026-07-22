package com.yatrasathi.backend.notification.controller;

import com.yatrasathi.backend.common.dto.ApiResponse;
import com.yatrasathi.backend.notification.entity.Notification;
import com.yatrasathi.backend.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getUserNotifications(@RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(ApiResponse.success(notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)));
    }
}
