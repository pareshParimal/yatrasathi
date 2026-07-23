package com.yatrasathi.backend.auth.service;

import com.yatrasathi.backend.auth.dto.AuthResponse;
import com.yatrasathi.backend.auth.dto.OtpVerificationRequest;
import com.yatrasathi.backend.auth.entity.User;
import com.yatrasathi.backend.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;

    public void generateOtp(String phone) {
        // In a real application, we would integrate with an SMS gateway (like Twilio, AWS SNS, etc.)
        // For this hackathon MVP, we will simulate the OTP generation and log it to the console.
        log.info("Simulating OTP Generation for phone {}. Use '123456' to verify.", phone);
    }

    public AuthResponse verifyOtp(OtpVerificationRequest request) {
        // For MVP, we simply check if OTP is the hardcoded simulation value
        if (!"123456".equals(request.getOtp())) {
            throw new IllegalArgumentException("Invalid OTP");
        }

        Optional<User> existingUserOpt = userRepository.findByPhone(request.getPhone());

        if (existingUserOpt.isPresent()) {
            return AuthResponse.builder()
                    .user(existingUserOpt.get())
                    .isNewUser(false)
                    .token("simulated-jwt-token")
                    .build();
        } else {
            // Register new user
            String name = request.getFullName() != null && !request.getFullName().isEmpty() 
                            ? request.getFullName() : "Yatri";
                            
            User newUser = User.builder()
                    .phone(request.getPhone())
                    .fullName(name)
                    .authProvider("OTP")
                    .role("USER")
                    .build();
            
            newUser = userRepository.save(newUser);
            
            return AuthResponse.builder()
                    .user(newUser)
                    .isNewUser(true)
                    .token("simulated-jwt-token")
                    .build();
        }
    }

    public void updateLanguagePref(java.util.UUID userId, String lang) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setLanguagePref(lang);
            userRepository.save(user);
        });
    }
}
