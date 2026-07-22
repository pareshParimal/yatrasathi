package com.yatrasathi.backend.place.repository;

import com.yatrasathi.backend.place.entity.PlaceHighlight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PlaceHighlightRepository extends JpaRepository<PlaceHighlight, UUID> {
    List<PlaceHighlight> findByPlaceIdOrderBySortOrderAsc(UUID placeId);
    List<PlaceHighlight> findByPlaceIdAndHighlightTypeOrderBySortOrderAsc(UUID placeId, String highlightType);
}
