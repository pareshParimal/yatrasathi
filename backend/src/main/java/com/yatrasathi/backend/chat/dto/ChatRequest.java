package com.yatrasathi.backend.chat.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class ChatRequest {
    private String message;
    private UUID placeId; // Optional context
}
