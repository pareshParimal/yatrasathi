package com.yatrasathi.backend.travel.repository;

import com.yatrasathi.backend.travel.entity.TravelPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TravelPlanRepository extends JpaRepository<TravelPlan, UUID> {
    List<TravelPlan> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
