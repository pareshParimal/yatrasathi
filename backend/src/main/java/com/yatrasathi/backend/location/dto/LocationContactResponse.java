package com.yatrasathi.backend.location.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationContactResponse {
    private UUID id;
    private String contactName;
    private String telegramChatId;
    private Boolean isActive;
}
