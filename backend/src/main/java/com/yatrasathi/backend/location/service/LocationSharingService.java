package com.yatrasathi.backend.location.service;

import com.yatrasathi.backend.location.dto.LocationUpdateRequest;
import com.yatrasathi.backend.location.entity.LocationSharingContact;
import com.yatrasathi.backend.location.repository.LocationContactRepository;
import com.yatrasathi.backend.location.telegram.TelegramBotService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class LocationSharingService {

    private final LocationContactRepository contactRepository;
    private final TelegramBotService telegramBotService;

    public void updateLocation(UUID userId, LocationUpdateRequest request) {
        // In a real application, we would check if a session is active
        // and only broadcast based on the sharing interval.
        // For MVP, we'll immediately broadcast to all active contacts.
        
        List<LocationSharingContact> contacts = contactRepository.findByUserIdAndIsActiveTrue(userId);
        
        for (LocationSharingContact contact : contacts) {
            // Ideally, we'd also check permissionGranted here, but we'll assume true for MVP
            telegramBotService.sendLocation(
                    contact.getTelegramChatId(), 
                    request.getLatitude(), 
                    request.getLongitude()
            ).subscribe(
                    success -> {
                        if (Boolean.TRUE.equals(success)) {
                            log.debug("Sent location to {}", contact.getContactName());
                        } else {
                            log.warn("Failed to send location to {}", contact.getContactName());
                        }
                    }
            );
        }
    }
}
