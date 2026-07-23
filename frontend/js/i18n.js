export const i18n = {
    hi: {
        "nav_home": "होम",
        "nav_planner": "यात्रा प्लानर",
        "nav_dashboard": "डैशबोर्ड",
        "nav_profile": "प्रोफाइल",
        "nav_login": "लॉगिन",
        "nav_logout": "लॉगआउट",
        "hero_title": "आपकी यात्रा, हमारा साथ",
        "hero_subtitle": "भारत भर में वरिष्ठ नागरिकों के लिए सुरक्षित, आरामदायक और व्यक्तिगत यात्रा का अनुभव।",
        "btn_plan_journey": "अपनी यात्रा की योजना बनाएं",
        
        // Planner Step 1
        "planner_title": "अपनी यात्रा की योजना बनाएं",
        "planner_from": "कहाँ से?",
        "planner_to": "कहाँ जाना है?",
        "planner_date": "यात्रा की तिथि",
        "planner_time_pref": "यात्रा का समय (आपकी सुविधा अनुसार)",
        "planner_morning": "सुबह (5 AM - 12 PM)",
        "planner_afternoon": "दोपहर (12 PM - 5 PM)",
        "planner_evening": "शाम (5 PM - 10 PM)",
        "planner_night": "रात (10 PM - 5 AM)",
        "planner_max_duration": "अधिकतम यात्रा अवधि",
        "planner_hotel_budget": "होटल का बजट (प्रति रात)",
        "planner_hotel_radius": "दर्शनीय स्थल से अधिकतम दूरी",
        "planner_food_pref": "भोजन की प्राथमिकता",
        "planner_special_req": "विशेष आवश्यकताएं (व्हीलचेयर, भूतल का कमरा, आदि)",
        "planner_share_telegram": "टेलीग्राम पर परिवार के साथ लाइव लोकेशन साझा करें",
        "btn_find_trains": "ट्रेन और होटल खोजें",
        
        // Planner Step 2
        "step2_title": "अपनी ट्रेन और होटल चुनें",
        "btn_edit_pref": "प्राथमिकताएं बदलें",
        "avail_trains": "उपलब्ध ट्रेनें",
        "avail_hotels": "आस-पास के होटल",
        "btn_confirm_booking": "बुकिंग की पुष्टि करें",
        
        // General
        "loading": "लोड हो रहा है..."
    },
    en: {
        "nav_home": "Home",
        "nav_planner": "Journey Planner",
        "nav_dashboard": "Dashboard",
        "nav_profile": "Profile",
        "nav_login": "Login",
        "nav_logout": "Logout",
        "hero_title": "Your Journey, Our Responsibility",
        "hero_subtitle": "Safe, comfortable, and personalized travel experiences for senior citizens across India.",
        "btn_plan_journey": "Plan Your Journey",
        
        "planner_title": "Plan Your Journey",
        "planner_from": "From Where?",
        "planner_to": "Where to?",
        "planner_date": "Travel Date",
        "planner_time_pref": "Travel Time (Your Convenience)",
        "planner_morning": "Morning (5 AM - 12 PM)",
        "planner_afternoon": "Afternoon (12 PM - 5 PM)",
        "planner_evening": "Evening (5 PM - 10 PM)",
        "planner_night": "Night (10 PM - 5 AM)",
        "planner_max_duration": "Maximum Journey Duration",
        "planner_hotel_budget": "Hotel Budget (Per Night)",
        "planner_hotel_radius": "Max Distance from Attraction",
        "planner_food_pref": "Food Preference",
        "planner_special_req": "Special Requirements (Wheelchair, Ground floor etc)",
        "planner_share_telegram": "Share live location with family on Telegram",
        "btn_find_trains": "Find Trains & Hotels",
        
        "step2_title": "Select Your Train & Hotel",
        "btn_edit_pref": "Edit Preferences",
        "avail_trains": "Available Trains",
        "avail_hotels": "Nearby Hotels",
        "btn_confirm_booking": "Confirm Booking",
        
        "loading": "Loading..."
    }
};

export function applyTranslations(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[lang] && i18n[lang][key]) {
            if (el.tagName === 'INPUT' && el.type === 'text') {
                el.placeholder = i18n[lang][key];
            } else {
                el.innerHTML = el.innerHTML.replace(el.textContent.trim(), i18n[lang][key]);
            }
        }
    });
}
