package com.yatrasathi.backend.travel.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
public class TravelPlanRequest {
    private String title;
    private String sourceLocation;
    private UUID destinationId;
    private String travelMedium;
    private LocalTime boardingTimePref;
    private LocalTime deboardingTimePref;
    private String travelDurationPref;
    private Double hotelMaxDistanceKm;
    private Double budgetMin;
    private Double budgetMax;
    private String foodPreference;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer numTravellers;
    private String specialRequirements;
    private Boolean shareLocationTelegram;
    private Integer locationShareIntervalHours;
}
