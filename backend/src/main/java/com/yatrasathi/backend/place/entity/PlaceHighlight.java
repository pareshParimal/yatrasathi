package com.yatrasathi.backend.place.entity;

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
@Table(name = "place_highlights")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaceHighlight {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id", nullable = false)
    private Place place;

    @Column(name = "highlight_type", nullable = false)
    private String highlightType; // FOOD, HANDICRAFT, GI_TAG, GEOGRAPHY

    @Column(nullable = false)
    private String title;

    @Column(name = "title_hi")
    private String titleHi;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "description_hi", columnDefinition = "TEXT")
    private String descriptionHi;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "gi_tag_number", length = 50)
    private String giTagNumber;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private JsonNode metadata;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
