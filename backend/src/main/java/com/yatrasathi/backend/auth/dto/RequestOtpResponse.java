package com.yatrasathi.backend.auth.dto;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RequestOtpResponse {

    private String message;
    private boolean isNewUser;

}