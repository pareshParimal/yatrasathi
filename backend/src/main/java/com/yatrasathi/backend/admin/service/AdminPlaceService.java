package com.yatrasathi.backend.admin.service;

import com.yatrasathi.backend.admin.dto.AdminPlaceRequest;
import com.yatrasathi.backend.place.entity.Place;
import com.yatrasathi.backend.place.repository.PlaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminPlaceService {

    private final PlaceRepository placeRepository;

    public Place createPlace(AdminPlaceRequest request) {
        Place place = Place.builder()
                .name(request.getName())
                .nameHi(request.getNameHi())
                .state(request.getState())
                .city(request.getCity())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .description(request.getDescription())
                .descriptionHi(request.getDescriptionHi())
                .imageUrls(request.getImageUrls())
                .tags(request.getTags())
                .bestSeason(request.getBestSeason())
                .status(request.getStatus() != null ? request.getStatus() : "DRAFT")
                .build();
        return placeRepository.save(place);
    }
    
    public Place updatePlace(UUID id, AdminPlaceRequest request) {
        Place place = placeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Place not found"));
                
        place.setName(request.getName());
        place.setNameHi(request.getNameHi());
        place.setState(request.getState());
        place.setCity(request.getCity());
        place.setLatitude(request.getLatitude());
        place.setLongitude(request.getLongitude());
        place.setDescription(request.getDescription());
        place.setDescriptionHi(request.getDescriptionHi());
        place.setImageUrls(request.getImageUrls());
        place.setTags(request.getTags());
        place.setBestSeason(request.getBestSeason());
        if (request.getStatus() != null) place.setStatus(request.getStatus());
        
        return placeRepository.save(place);
    }
}
