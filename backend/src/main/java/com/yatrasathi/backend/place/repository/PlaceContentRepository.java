package com.yatrasathi.backend.place.repository;

import com.yatrasathi.backend.place.entity.PlaceContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PlaceContentRepository extends JpaRepository<PlaceContent, UUID> {
    List<PlaceContent> findByPlaceIdAndStatusOrderBySortOrderAsc(UUID placeId, String status);
    List<PlaceContent> findByPlaceIdAndContentTypeAndStatusOrderBySortOrderAsc(UUID placeId, String contentType, String status);
}
