package com.yatrasathi.backend.auth.controller;

import com.yatrasathi.backend.auth.dto.AuthResponse;
import com.yatrasathi.backend.auth.dto.LoginRequest;
import com.yatrasathi.backend.auth.dto.OtpVerificationRequest;
import com.yatrasathi.backend.auth.dto.RequestOtpResponse;
import com.yatrasathi.backend.auth.repository.UserRepository;
import com.yatrasathi.backend.auth.service.AuthService;
import com.yatrasathi.backend.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/request-otp")
    public ApiResponse<RequestOtpResponse> requestOtp(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success(authService.generateOtp(request.getPhone())
        );
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(@RequestBody OtpVerificationRequest request) {
        try {
            AuthResponse response = authService.verifyOtp(request);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/language")
    public ResponseEntity<ApiResponse<String>> updateLanguagePref(
            @RequestHeader("x-user-id") UUID userId,
            @RequestParam String lang) {
        authService.updateLanguagePref(userId, lang);
        return ResponseEntity.ok(ApiResponse.success("Language preference updated to " + lang));
    }
}
