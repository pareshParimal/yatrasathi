package com.yatrasathi.backend.place.entity;

import com.fasterxml.jackson.databind.JsonNode;
import com.yatrasathi.backend.auth.entity.User;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "place_content")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaceContent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id", nullable = false)
    private Place place;

    @Column(name = "content_type", nullable = false)
    private String contentType; // HISTORICAL, CULTURAL, POLITICAL, ADMINISTRATIVE

    @Column(nullable = false, length = 500)
    private String title;

    @Column(name = "title_hi", length = 500)
    private String titleHi;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb", nullable = false)
    private JsonNode content;

    @Type(JsonType.class)
    @Column(name = "content_hi", columnDefinition = "jsonb")
    private JsonNode contentHi;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

    @Builder.Default
    private String source = "CURATED"; // CURATED, AI_GENERATED

    @Builder.Default
    private String status = "DRAFT";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
