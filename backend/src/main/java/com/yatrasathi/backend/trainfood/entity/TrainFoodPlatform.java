package com.yatrasathi.backend.trainfood.entity;

import com.fasterxml.jackson.databind.JsonNode;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "train_food_platforms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainFoodPlatform {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "website_url", length = 500)
    private String websiteUrl;

    @Column(name = "app_url", length = 500)
    private String appUrl;

    @Column(name = "ordering_url", length = 500)
    private String orderingUrl;

    @Type(JsonType.class)
    @Column(name = "supported_stations", columnDefinition = "jsonb")
    private JsonNode supportedStations;

    @Type(JsonType.class)
    @Column(name = "cuisine_types", columnDefinition = "jsonb")
    private JsonNode cuisineTypes;

    @Column(name = "has_veg")
    @Builder.Default
    private Boolean hasVeg = true;

    @Column(name = "has_non_veg")
    @Builder.Default
    private Boolean hasNonVeg = true;

    @Column(name = "has_jain")
    @Builder.Default
    private Boolean hasJain = false;

    @Column(name = "avg_rating", columnDefinition = "NUMERIC(2,1)")
    private Double avgRating;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
