INSERT INTO place_content (id, place_id, content_type, title, title_hi, content, content_hi, status, created_at, updated_at) 
SELECT 
    gen_random_uuid(), 
    id, 
    'HISTORICAL', 
    'The Pallava Empire''s Architectural Marvel', 
    'पल्लव साम्राज्य का स्थापत्य चमत्कार',
    '{"historical": "Mahabalipuram (Mamallapuram) was a major seaport of the ancient Pallava kingdom. Important rulers like Mahendravarman I and Narasimhavarman I and II commissioned these magnificent rock-cut caves and structural temples in the 7th and 8th centuries.", "cultural": "It is a UNESCO World Heritage site known for the Shore Temple, Pancha Rathas, and Arjuna''s Penance, reflecting the zenith of Pallava art and culture."}'::jsonb,
    '{"historical": "महाबलीपुरम (मामल्लपुरम) प्राचीन पल्लव साम्राज्य का एक प्रमुख बंदरगाह था। महेंद्रवर्मन प्रथम और नरसिंहवर्मन प्रथम और द्वितीय जैसे महत्वपूर्ण शासकों ने 7वीं और 8वीं शताब्दी में इन शानदार रॉक-कट गुफाओं और संरचनात्मक मंदिरों का निर्माण कराया था।", "cultural": "यह एक यूनेस्को विश्व धरोहर स्थल है जो शोर मंदिर, पंच रथ और अर्जुन तपस्या के लिए जाना जाता है, जो पल्लव कला और संस्कृति के चरमोत्कर्ष को दर्शाता है।"}'::jsonb,
    'PUBLISHED',
    NOW(),
    NOW()
FROM places WHERE name = 'Mahabalipuram';
