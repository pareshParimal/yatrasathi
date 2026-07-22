package com.yatrasathi.backend.notification.service;

import com.yatrasathi.backend.auth.entity.User;
import com.yatrasathi.backend.auth.repository.UserRepository;
import com.yatrasathi.backend.location.telegram.TelegramBotService;
import com.yatrasathi.backend.notification.entity.Notification;
import com.yatrasathi.backend.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final TelegramBotService telegramBotService;
    private final UserRepository userRepository;

    @Async
    public void sendNotification(UUID userId, String channel, String type, String title, String body) {
        User user = userRepository.findById(userId).orElseThrow();
        
        Notification notification = Notification.builder()
                .user(user)
                .channel(channel)
                .type(type)
                .title(title)
                .body(body)
                .build();
                
        // In a full implementation, check NotificationPreference first to see if channel is enabled
        // Also check quiet hours.
        
        if ("TELEGRAM".equalsIgnoreCase(channel)) {
            // Usually we'd look up the user's personal chat ID for Telegram.
            // For MVP, we'll mock it via the bot service.
            telegramBotService.sendMessage("mock_chat_id", title + "\n" + body).subscribe();
            notification.setSentAt(LocalDateTime.now());
        } else if ("EMAIL".equalsIgnoreCase(channel)) {
            // Mock SES integration
            log.info("MOCK SES EMAIL to {}: Subject: {}, Body: {}", user.getEmail(), title, body);
            notification.setSentAt(LocalDateTime.now());
        } else {
            log.warn("Unsupported notification channel: {}", channel);
        }

        notificationRepository.save(notification);
    }
}
