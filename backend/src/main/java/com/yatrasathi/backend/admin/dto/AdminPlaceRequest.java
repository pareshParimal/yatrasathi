package com.yatrasathi.backend.admin.dto;

import lombok.Data;

import java.util.List;

@Data
public class AdminPlaceRequest {
    private String name;
    private String nameHi;
    private String state;
    private String city;
    private Double latitude;
    private Double longitude;
    private String description;
    private String descriptionHi;
    private List<String> imageUrls;
    private List<String> tags;
    private String bestSeason;
    private String status;
}
