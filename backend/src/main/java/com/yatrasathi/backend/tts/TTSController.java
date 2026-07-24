package com.yatrasathi.backend.tts;

import com.yatrasathi.backend.common.dto.ApiResponse;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tts")
@RequiredArgsConstructor
public class TTSController {

    private final SarvamClient sarvamClient;

    @PostMapping("/generate")
    public ResponseEntity<byte[]> generateSpeech(@RequestBody TTSRequest request) {
        byte[] audioData = sarvamClient.generateSpeech(request.getText(), request.getLanguageCode());
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.valueOf("audio/wav"));
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(audioData);
    }

    @Data
    public static class TTSRequest {
        private String text;
        private String languageCode;
    }
}
