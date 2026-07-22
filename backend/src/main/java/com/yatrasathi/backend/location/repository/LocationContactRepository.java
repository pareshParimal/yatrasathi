package com.yatrasathi.backend.location.repository;

import com.yatrasathi.backend.location.entity.LocationSharingContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LocationContactRepository extends JpaRepository<LocationSharingContact, UUID> {
    List<LocationSharingContact> findByUserIdAndIsActiveTrue(UUID userId);
}
