package com.yatrasathi.backend.auth.dto;

import com.yatrasathi.backend.auth.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private User user;
    private boolean isNewUser;
    private String token; // Optional JWT token for future scaling, MVP can just use User ID
}
