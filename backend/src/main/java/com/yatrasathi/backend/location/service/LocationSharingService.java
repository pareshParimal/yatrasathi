package com.yatrasathi.backend.location.service;

import com.yatrasathi.backend.auth.entity.User;
import com.yatrasathi.backend.auth.repository.UserRepository;
import com.yatrasathi.backend.location.dto.LocationContactRequest;
import com.yatrasathi.backend.location.dto.LocationContactResponse;
import com.yatrasathi.backend.location.dto.LocationUpdateRequest;
import com.yatrasathi.backend.location.entity.LocationSharingContact;
import com.yatrasathi.backend.location.repository.LocationContactRepository;
import com.yatrasathi.backend.location.telegram.TelegramBotService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LocationSharingService {

    private final LocationContactRepository contactRepository;
    private final TelegramBotService telegramBotService;
    private final UserRepository userRepository;

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

    public LocationContactResponse addContact(UUID userId, LocationContactRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocationSharingContact contact = LocationSharingContact.builder()
                .user(user)
                .contactName(request.getContactName())
                .telegramChatId(request.getTelegramChatId())
                .isActive(true)
                .permissionGranted(true)
                .build();

        contact = contactRepository.save(contact);

        return LocationContactResponse.builder()
                .id(contact.getId())
                .contactName(contact.getContactName())
                .telegramChatId(contact.getTelegramChatId())
                .isActive(contact.getIsActive())
                .build();
    }

    public List<LocationContactResponse> getContacts(UUID userId) {
        return contactRepository.findByUserIdAndIsActiveTrue(userId).stream()
                .map(c -> LocationContactResponse.builder()
                        .id(c.getId())
                        .contactName(c.getContactName())
                        .telegramChatId(c.getTelegramChatId())
                        .isActive(c.getIsActive())
                        .build())
                .collect(Collectors.toList());
    }

    public void deleteContact(UUID userId, UUID contactId) {
        LocationSharingContact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new RuntimeException("Contact not found"));

        if (!contact.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        contact.setIsActive(false);
        contactRepository.save(contact);
    }
}
