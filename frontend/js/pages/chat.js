import { api } from '../api.js';

export const renderChat = async (rootElement) => {
    rootElement.innerHTML = `
        <div class="dashboard-header" style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h1>AI Assistant</h1>
                <p>Ask anything about your travel, historical facts, or medical requirements.</p>
            </div>
            <div>
                <button id="btn-toggle-voice" class="btn-primary" style="background-color: var(--surface); color: var(--text-main); border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 8px;">
                    <i data-lucide="volume-2" id="icon-voice"></i> Voice: ON
                </button>
            </div>
        </div>

        <div class="card" style="margin-top: 2rem; display: flex; flex-direction: column; height: 600px; padding: 0;">
            
            <!-- Chat History Area -->
            <div id="chat-history" style="flex: 1; padding: 2rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1.5rem;">
                
                <!-- Welcome Message -->
                <div style="align-self: flex-start; max-width: 80%;">
                    <div style="background-color: #f1f5f9; padding: 1rem 1.5rem; border-radius: 20px 20px 20px 0; color: var(--text-main);">
                        Namaste! 🙏 I am your YatraSathi AI Assistant. I can help you plan a trip, book a wheelchair, and order food. What would you like to do?
                    </div>
                </div>

                <!-- Suggestion Chips -->
                <div id="suggestion-chips" style="display: flex; gap: 0.8rem; overflow-x: auto; padding-bottom: 0.5rem; align-self: flex-start; max-width: 100%;">
                    <button class="chip-btn" data-text="I want to plan a new trip" data-i18n="chip_plan_trip">Plan a trip</button>
                    <button class="chip-btn" data-text="I need wheelchair assistance" data-i18n="chip_wheelchair">Need a wheelchair</button>
                    <button class="chip-btn" data-text="Find pure veg food options" data-i18n="chip_veg_food">Find Veg Food</button>
                    <button class="chip-btn" data-text="What is the hotel distance from station?" data-i18n="chip_hotel_dist">Hotel distance?</button>
                    <button class="chip-btn" data-text="I want morning trains" data-i18n="chip_morning_trains">Morning Trains</button>
                </div>
            </div>

            <!-- Input Area -->
            <div style="padding: 1.5rem; border-top: 1px solid #e2e8f0; background: var(--bg-surface); border-radius: 0 0 var(--radius-lg) var(--radius-lg); position: relative;">
                
                <!-- Pulse animation for mic -->
                <style>
                    @keyframes pulse-ring {
                        0% { transform: scale(1); opacity: 0.8; }
                        100% { transform: scale(1.5); opacity: 0; }
                    }
                    .mic-listening::before {
                        content: '';
                        position: absolute;
                        top: 0; left: 0; right: 0; bottom: 0;
                        border-radius: 50%;
                        background-color: #ef4444;
                        animation: pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
                        z-index: -1;
                    }
                    .chip-btn {
                        background-color: #e2e8f0;
                        border: none;
                        border-radius: 20px;
                        padding: 0.5rem 1rem;
                        font-size: 0.9rem;
                        color: #334155;
                        cursor: pointer;
                        white-space: nowrap;
                        transition: background-color 0.2s;
                    }
                    .chip-btn:hover {
                        background-color: #cbd5e1;
                    }
                </style>

                <form id="chat-form" style="display: flex; gap: 1rem; align-items: center;">
                    <div style="position: relative;">
                        <button type="button" id="btn-mic" style="background: none; border: none; cursor: pointer; color: white; padding: 1rem; border-radius: 50%; transition: all 0.3s; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; background-color: var(--primary); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                            <i data-lucide="mic" id="icon-mic" style="width: 32px; height: 32px;"></i>
                        </button>
                    </div>
                    
                    <input type="text" id="chat-input" class="form-control" placeholder="Tap the big microphone to speak..." style="flex: 1; height: 50px; font-size: 1.1rem;" autocomplete="off" required>
                    
                    <button type="submit" class="btn-primary" id="btn-send" style="padding: 0 1.5rem; display: flex; align-items: center; justify-content: center; height: 50px; border-radius: 25px;">
                        <i data-lucide="send"></i>
                    </button>
                </form>
            </div>
        </div>
    `;
    lucide.createIcons();

    // Trigger translation after updating innerHTML
    if (window.i18n && typeof window.i18n.updatePageContent === 'function') {
        window.i18n.updatePageContent();
    }

    const form = document.getElementById('chat-form');
    const input = document.getElementById('chat-input');
    const history = document.getElementById('chat-history');
    const btnSend = document.getElementById('btn-send');
    const btnMic = document.getElementById('btn-mic');
    const iconMic = document.getElementById('icon-mic');
    const btnToggleVoice = document.getElementById('btn-toggle-voice');

    // Manage session state dynamically
    let currentSessionId = null;

    // State
    let isVoiceEnabled = true;
    let isListening = false;
    let recognition = null;

    // Initialize Web Speech API for TTS
    const speakText = (text) => {
        if (!isVoiceEnabled || !('speechSynthesis' in window)) return;
        
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        // Optimize for elderly: slightly slower rate, higher pitch for clarity
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        
        // Detect if text contains Hindi characters
        const isHindi = /[\u0900-\u097F]/.test(text);
        
        // Try to find the best voice available
        const voices = window.speechSynthesis.getVoices();
        let selectedVoice = null;
        
        if (isHindi) {
            // Prefer Google Hindi for better quality, fallback to any Hindi
            selectedVoice = voices.find(v => v.lang.includes('hi-IN') && v.name.includes('Google')) || 
                            voices.find(v => v.lang.includes('hi-IN'));
        } else {
            // Prefer Google Indian English, fallback to any Indian English, then any Google English
            selectedVoice = voices.find(v => v.lang.includes('en-IN') && v.name.includes('Google')) || 
                            voices.find(v => v.lang.includes('en-IN')) ||
                            voices.find(v => v.lang.includes('en-') && v.name.includes('Google'));
        }

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        window.speechSynthesis.speak(utterance);
    };

    // Toggle Voice Output
    btnToggleVoice.addEventListener('click', () => {
        isVoiceEnabled = !isVoiceEnabled;
        if (isVoiceEnabled) {
            btnToggleVoice.innerHTML = '<i data-lucide="volume-2"></i> Voice: ON';
        } else {
            btnToggleVoice.innerHTML = '<i data-lucide="volume-x"></i> Voice: OFF';
            window.speechSynthesis.cancel(); // Stop speaking immediately
        }
        lucide.createIcons();
    });

    // Initialize Web Speech API for STT
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-IN'; // Indian English, could be dynamic

        recognition.onstart = () => {
            isListening = true;
            btnMic.style.backgroundColor = '#ef4444'; // Red for listening
            btnMic.style.color = 'white'; 
            btnMic.parentElement.classList.add('mic-listening');
            iconMic.setAttribute('data-lucide', 'mic');
            input.placeholder = "Listening... Speak now";
            lucide.createIcons();
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            
            input.value = finalTranscript || interimTranscript;
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            stopListening();
        };

        recognition.onend = () => {
            stopListening();
            // Automatically submit if there is text
            if (input.value.trim() !== '') {
                form.dispatchEvent(new Event('submit'));
            }
        };
    } else {
        // Browser doesn't support SpeechRecognition
        btnMic.style.display = 'none';
        console.warn("Speech Recognition API not supported in this browser.");
    }

    const stopListening = () => {
        isListening = false;
        btnMic.style.backgroundColor = 'var(--primary)';
        btnMic.style.color = 'white';
        btnMic.parentElement.classList.remove('mic-listening');
        input.placeholder = "Tap the big microphone to speak...";
    };

    btnMic.addEventListener('click', () => {
        if (!recognition) return;
        
        if (isListening) {
            recognition.stop();
        } else {
            input.value = '';
            recognition.start();
        }
    });

    // Handle suggestion chips
    document.querySelectorAll('.chip-btn').forEach(chip => {
        chip.addEventListener('click', () => {
            const currentVal = input.value.trim();
            const newText = chip.getAttribute('data-text');
            
            if (currentVal) {
                input.value = currentVal + ', ' + newText;
            } else {
                input.value = newText;
            }
            
            // Focus the input to encourage the user to click send when ready
            input.focus();
        });
    });


    // Form Submission Logic
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const message = input.value.trim();
        if(!message) return;

        // Stop TTS if user sends a new message while bot is speaking
        window.speechSynthesis.cancel();

        // Add user message to UI
        history.innerHTML += `
            <div style="align-self: flex-end; max-width: 80%;">
                <div style="background-color: var(--primary); color: white; padding: 1rem 1.5rem; border-radius: 20px 20px 0 20px;">
                    ${message}
                </div>
            </div>
        `;
        
        input.value = '';
        input.disabled = true;
        btnMic.disabled = true;
        btnSend.innerHTML = '<i data-lucide="loader-2" class="lucide-spin"></i>';
        lucide.createIcons();
        
        // Scroll to bottom
        history.scrollTop = history.scrollHeight;

        try {
            // Call Backend Gemini API
            const response = await api.sendMessage({
                message: message
            }, currentSessionId);
            
            if (response.session && response.session.id) {
                currentSessionId = response.session.id;
            }

            let botText = response.content;
            
            // Check if the backend returned an error string instead of failing the HTTP request
            if (botText.includes('Sorry, the AI service') || botText.includes('Sorry, I had trouble')) {
                throw new Error("AI Backend returned an error message");
            }
            
            // Check for JSON payload for SEARCH action
            const jsonRegex = /```json\n([\s\S]*?)\n```/;
            const match = botText.match(jsonRegex);
            let shouldRedirectToPlanner = false;
            
            if (match && match[1]) {
                try {
                    const payload = JSON.parse(match[1]);
                    if (payload.action === "SEARCH") {
                        // Enhance remote AI payload with local keyword extraction
                        const msgLower = message.toLowerCase();
                        if (msgLower.includes('morning') && !payload.timePreference) payload.timePreference = 'morning';
                        if (msgLower.includes('wheelchair') && payload.wheelchairRequired === undefined) payload.wheelchairRequired = true;
                        if (msgLower.includes('veg') && !payload.foodPreference) payload.foodPreference = 'VEG';
                        if ((msgLower.includes('1 km') || msgLower.includes('1km')) && !payload.hotelMaxDistanceKm) payload.hotelMaxDistanceKm = 1;
                        if ((msgLower.includes('500m') || msgLower.includes('500 m')) && !payload.hotelMaxDistanceKm) payload.hotelMaxDistanceKm = 0.5;

                        // Store the payload in sessionStorage for planner.js to pick up
                        sessionStorage.setItem('ai_search_payload', JSON.stringify(payload));
                        shouldRedirectToPlanner = true;
                    }
                } catch(e) {
                    console.error("Failed to parse JSON payload from AI", e);
                }
                
                // Remove the JSON block from the text shown to user
                botText = botText.replace(jsonRegex, '').trim();
            }

            // Add bot response to UI
            history.innerHTML += `
                <div style="align-self: flex-start; max-width: 80%;">
                    <div style="background-color: #f1f5f9; padding: 1rem 1.5rem; border-radius: 20px 20px 20px 0; color: var(--text-main);">
                        ${botText}
                    </div>
                </div>
            `;
            
            // Trigger TTS
            speakText(botText);
            
            // Redirect if we have a search action
            if (shouldRedirectToPlanner) {
                setTimeout(() => {
                    window.location.hash = '#planner';
                }, 1500); // Wait a short moment before redirecting
            }

        } catch(error) {
            // Fallback NLP if AI is rate limited or unavailable
            let fallbackPayload = null;
            const msgLower = message.toLowerCase();
            
            if (msgLower.includes('trip') || msgLower.includes('plan') || msgLower.includes('wheelchair') || msgLower.includes('veg') || msgLower.includes('morning') || msgLower.includes('1 km') || msgLower.includes('1km') || msgLower.includes('500m') || msgLower.includes('500 m')) {
                fallbackPayload = { action: "SEARCH" };
                if (msgLower.includes('wheelchair')) fallbackPayload.wheelchairRequired = true;
                if (msgLower.includes('veg')) fallbackPayload.foodPreference = 'VEG';
                if (msgLower.includes('morning')) fallbackPayload.timePreference = 'morning';
                if (msgLower.includes('1 km') || msgLower.includes('1km')) fallbackPayload.hotelMaxDistanceKm = 1;
                if (msgLower.includes('500m') || msgLower.includes('500 m')) fallbackPayload.hotelMaxDistanceKm = 0.5;
            }

            if (fallbackPayload) {
                history.innerHTML += `
                    <div style="align-self: flex-start; max-width: 80%;">
                        <div style="background-color: #f1f5f9; padding: 1rem 1.5rem; border-radius: 20px 20px 20px 0; color: var(--text-main);">
                            The AI is currently busy, but I understood what you need! Setting up your preferences now...
                        </div>
                    </div>
                `;
                sessionStorage.setItem('ai_search_payload', JSON.stringify(fallbackPayload));
                setTimeout(() => {
                    window.location.hash = '#planner';
                }, 2000);
            } else {
                history.innerHTML += `
                    <div style="align-self: flex-start; max-width: 80%;">
                        <div style="background-color: #fee2e2; color: #991b1b; padding: 1rem 1.5rem; border-radius: 20px 20px 20px 0;">
                            Sorry, the AI service is currently unavailable. (${error.message})
                        </div>
                    </div>
                `;
            }
        } finally {
            input.disabled = false;
            btnMic.disabled = false;
            btnSend.innerHTML = '<i data-lucide="send"></i>';
            lucide.createIcons();
            input.focus();
            history.scrollTop = history.scrollHeight;
        }
    });
    
    // Attempt to pre-load voices to avoid delay on first TTS call
    if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
    }
};
