package com.yatrasathi.backend.auth.dto;

import lombok.Data;

@Data
public class OtpVerificationRequest {
    private String phone;
    private String otp;
    private String fullName; // Optional, used if it's a new user registration
}
