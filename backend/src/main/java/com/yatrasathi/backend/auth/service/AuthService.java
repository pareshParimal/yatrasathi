package com.yatrasathi.backend.auth.service;

import com.yatrasathi.backend.auth.dto.AuthResponse;
import com.yatrasathi.backend.auth.dto.OtpVerificationRequest;
import com.yatrasathi.backend.auth.dto.RequestOtpResponse;
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

    public RequestOtpResponse generateOtp(String phone) {

        log.info("Simulating OTP Generation for phone {}. Use '123456' to verify.", phone);

        boolean isNewUser = userRepository.findByPhone(phone).isEmpty();

        return RequestOtpResponse.builder()
            .message("OTP sent successfully. (Check server logs, simulation is 123456)")
            .isNewUser(isNewUser)
            .build();
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
