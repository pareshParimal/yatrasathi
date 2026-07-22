package com.yatrasathi.backend.travel.entity;

import com.yatrasathi.backend.auth.entity.User;
import com.yatrasathi.backend.place.entity.Place;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "travel_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TravelPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @Column(nullable = false)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_id")
    private Place destination;

    @Column(name = "travel_medium", nullable = false)
    private String travelMedium; // TRAIN, BUS, FLIGHT, CAR

    @Column(name = "boarding_time_pref")
    private LocalTime boardingTimePref;

    @Column(name = "deboarding_time_pref")
    private LocalTime deboardingTimePref;

    // using string to store duration e.g. "8 hours" or "2 days"
    @Column(name = "travel_duration_pref")
    private String travelDurationPref;

    @Column(name = "hotel_max_distance_km", columnDefinition = "NUMERIC(5,2)")
    private Double hotelMaxDistanceKm;

    @Column(name = "budget_min", columnDefinition = "NUMERIC(10,2)")
    private Double budgetMin;

    @Column(name = "budget_max", columnDefinition = "NUMERIC(10,2)")
    private Double budgetMax;

    @Column(name = "food_preference")
    private String foodPreference; // VEG, NON_VEG, JAIN, VEGAN

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "num_travellers")
    @Builder.Default
    private Integer numTravellers = 1;

    @Column(name = "special_requirements", columnDefinition = "TEXT")
    private String specialRequirements;

    @Column(name = "share_location_telegram")
    @Builder.Default
    private Boolean shareLocationTelegram = false;

    @Column(name = "location_share_interval_hours")
    private Integer locationShareIntervalHours;

    @Column(name = "last_location_shared_at")
    private LocalDateTime lastLocationSharedAt;

    @Builder.Default
    private String status = "DRAFT"; // DRAFT, PLANNED, ONGOING, COMPLETED

    @Column(name = "pnr_number")
    private String pnrNumber;

    @Column(name = "booked_train_name")
    private String bookedTrainName;

    @Column(name = "booked_hotel_name")
    private String bookedHotelName;

    @Column(name = "booking_status")
    @Builder.Default
    private String bookingStatus = "PENDING"; // PENDING, CONFIRMED

    @Column(name = "ecatering_order_id")
    private String ecateringOrderId;

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("dayNumber ASC, sortOrder ASC")
    @Builder.Default
    private List<PlanItineraryItem> itineraryItems = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
