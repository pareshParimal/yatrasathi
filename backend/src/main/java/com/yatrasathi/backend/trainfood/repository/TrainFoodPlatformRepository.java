package com.yatrasathi.backend.trainfood.repository;

import com.yatrasathi.backend.trainfood.entity.TrainFoodPlatform;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TrainFoodPlatformRepository extends JpaRepository<TrainFoodPlatform, UUID> {
    List<TrainFoodPlatform> findByIsActiveTrue();
}
