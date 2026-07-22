package com.yatrasathi.backend;

import com.yatrasathi.backend.auth.entity.User;
import com.yatrasathi.backend.auth.repository.UserRepository;
import com.yatrasathi.backend.place.entity.Place;
import com.yatrasathi.backend.place.entity.PlaceContent;
import com.yatrasathi.backend.place.entity.PlaceHighlight;
import com.yatrasathi.backend.place.repository.PlaceContentRepository;
import com.yatrasathi.backend.place.repository.PlaceHighlightRepository;
import com.yatrasathi.backend.place.repository.PlaceRepository;
import com.yatrasathi.backend.trainfood.entity.TrainFoodPlatform;
import com.yatrasathi.backend.trainfood.repository.TrainFoodPlatformRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PlaceRepository placeRepository;
    private final PlaceContentRepository placeContentRepository;
    private final PlaceHighlightRepository placeHighlightRepository;
    private final TrainFoodPlatformRepository trainFoodPlatformRepository;

    public DatabaseSeeder(UserRepository userRepository,
                          PlaceRepository placeRepository,
                          PlaceContentRepository placeContentRepository,
                          PlaceHighlightRepository placeHighlightRepository,
                          TrainFoodPlatformRepository trainFoodPlatformRepository) {
        this.userRepository = userRepository;
        this.placeRepository = placeRepository;
        this.placeContentRepository = placeContentRepository;
        this.placeHighlightRepository = placeHighlightRepository;
        this.trainFoodPlatformRepository = trainFoodPlatformRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0 || placeRepository.count() == 0) {
            seedDatabase();
        }
    }

    private void seedDatabase() {
        System.out.println("Seeding database with initial data...");

        // 1. Seed User (Mock user for MVP frontend)
        if (userRepository.count() == 0) {
            User user = User.builder()
                    .id(UUID.fromString("00000000-0000-0000-0000-000000000001"))
                    .phone("+919876543210")
                    .fullName("Test User")
                    .authProvider("OTP")
                    .role("USER")
                    .build();
            userRepository.save(user);
        }

        // 2. Seed Place: Mahabalipuram
        Place mahabalipuram = Place.builder()
                .name("Mahabalipuram")
                .state("Tamil Nadu")
                .latitude(12.6208)
                .longitude(80.1945)
                .status("PUBLISHED")
                .build();
        mahabalipuram = placeRepository.save(mahabalipuram);

        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        com.fasterxml.jackson.databind.node.ObjectNode jsonContent = mapper.createObjectNode();
        jsonContent.put("historical", "Mahabalipuram (Mamallapuram) was a major seaport of the ancient Pallava kingdom. Important rulers like Mahendravarman I and Narasimhavarman I and II commissioned these magnificent rock-cut caves and structural temples in the 7th and 8th centuries.");
        jsonContent.put("cultural", "It is a UNESCO World Heritage site known for the Shore Temple, Pancha Rathas, and Arjuna's Penance, reflecting the zenith of Pallava art and culture.");
        
        PlaceContent content = PlaceContent.builder()
                .place(mahabalipuram)
                .title("The Pallava Empire's Architectural Marvel")
                .contentType("HISTORICAL")
                .content(jsonContent)
                .status("PUBLISHED")
                .build();
        placeContentRepository.save(content);

        PlaceHighlight highlight1 = PlaceHighlight.builder()
                .place(mahabalipuram)
                .title("Shore Temple")
                .highlightType("ARCHITECTURE")
                .description("An 8th-century structural temple overlooking the Bay of Bengal.")
                .build();
        placeHighlightRepository.save(highlight1);

        // 3. Seed Train Food Platforms
        TrainFoodPlatform irctc = TrainFoodPlatform.builder()
                .name("IRCTC eCatering")
                .description("Official e-catering service by Indian Railways.")
                .websiteUrl("https://www.ecatering.irctc.co.in/")
                .avgRating(4.2)
                .hasVeg(true)
                .hasNonVeg(true)
                .hasJain(true)
                .build();
        
        TrainFoodPlatform zoop = TrainFoodPlatform.builder()
                .name("Zoop")
                .description("Order food in train via WhatsApp.")
                .websiteUrl("https://www.zoopindia.com/")
                .avgRating(4.5)
                .hasVeg(true)
                .hasNonVeg(true)
                .hasJain(true)
                .build();

        trainFoodPlatformRepository.save(irctc);
        trainFoodPlatformRepository.save(zoop);

        System.out.println("Database seeding completed!");
    }
}
