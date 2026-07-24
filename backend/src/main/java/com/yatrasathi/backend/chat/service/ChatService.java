package com.yatrasathi.backend.chat.service;

import com.yatrasathi.backend.auth.entity.User;
import com.yatrasathi.backend.auth.repository.UserRepository;
import com.yatrasathi.backend.chat.dto.ChatRequest;
import com.yatrasathi.backend.chat.entity.ChatMessage;
import com.yatrasathi.backend.chat.entity.ChatSession;
import com.yatrasathi.backend.chat.repository.ChatMessageRepository;
import com.yatrasathi.backend.chat.repository.ChatSessionRepository;
import com.yatrasathi.backend.place.entity.Place;
import com.yatrasathi.backend.place.repository.PlaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final GeminiService geminiService;
    private final UserRepository userRepository;
    private final PlaceRepository placeRepository;

    public ChatMessage sendMessage(UUID sessionId, ChatRequest request, UUID userId) {
        ChatSession session;
        if (sessionId == null) {
            User user = userRepository.findById(userId).orElseThrow();
            Place place = request.getPlaceId() != null ? placeRepository.findById(request.getPlaceId()).orElse(null) : null;
            session = ChatSession.builder()
                    .user(user)
                    .place(place)
                    .title("Chat regarding " + (place != null ? place.getName() : "General"))
                    .build();
            session = chatSessionRepository.save(session);
        } else {
            session = chatSessionRepository.findById(sessionId).orElseThrow();
        }

        // Save User Message
        ChatMessage userMsg = ChatMessage.builder()
                .session(session)
                .role("USER")
                .content(request.getMessage())
                .build();
        chatMessageRepository.save(userMsg);

        // Fetch history
        List<ChatMessage> history = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(session.getId());
        String conversationHistory = history.stream()
                .map(msg -> msg.getRole() + ": " + msg.getContent())
                .collect(Collectors.joining("\n"));

        User user = session.getUser();
        String langPref = user != null && user.getLanguagePref() != null ? user.getLanguagePref() : "hi";
        String langInstruction = "hi".equalsIgnoreCase(langPref) 
                ? "CRITICAL: You MUST converse entirely in Hindi using the Devanagari script." 
                : "You must converse in English.";

        // Build Prompt Context
        String systemPrompt = "System: You are 'YatraSathi AI', an empathetic, patient, and helpful travel assistant for senior citizens in India. "
                + langInstruction + " "
                + "Your goal is to help the user plan a train journey and book hotels. "
                + "You must casually ask them where they want to travel from, where they want to go, and on what date. "
                + "You should also politely ask if they have any food preferences (Veg, Non-Veg, or No Food), time preference (Morning, Afternoon, Evening, Night), if they require wheelchair assistance, and their preferred hotel distance from the station (e.g. 500m or 1km). "
                + "Additionally, you MUST ask if the traveller would like to order food to be delivered to their seat on the train, and if so, at which station they want the food delivered and which specific food item they would like to order. "
                + "Ask these questions conversationally and naturally, one or two at a time. "
                + "Once you have successfully gathered ALL necessary details (From City, To City, Travel Date, Food Preference, Wheelchair need, Time preference, Hotel distance, and whether they want train food, the station, and the item), you MUST output a special JSON payload at the very end of your response exactly like this: "
                + "```json\n{\"action\": \"SEARCH\", \"fromCity\": \"<extracted_from_city>\", \"toCity\": \"<extracted_to_city>\", \"travelDate\": \"<extracted_date_yyyy-mm-dd>\", \"foodPreference\": \"VEG/NON_VEG/NONE\", \"wheelchairRequired\": true/false, \"timePreference\": \"morning/afternoon/evening/night/any\", \"hotelMaxDistanceKm\": <number_in_km>, \"orderTrainFood\": true/false, \"trainFoodStation\": \"<station_name_or_null>\", \"trainFoodItem\": \"<item_name_or_null>\"}\n```. "
                + "Do not output the JSON until you have all the information. "
                + "If the user is missing information, just ask for it. \n\n"
                + "Conversation History:\n" + conversationHistory + "\n"
                + "USER: " + request.getMessage() + "\nASSISTANT: ";

        // Get AI Response synchronously (blocking just for simplicity in MVP Controller)
        String aiResponse = geminiService.generateContent(systemPrompt).block();

        // Save AI Message
        ChatMessage aiMsg = ChatMessage.builder()
                .session(session)
                .role("ASSISTANT")
                .content(aiResponse)
                .build();
        return chatMessageRepository.save(aiMsg);
    }
}
