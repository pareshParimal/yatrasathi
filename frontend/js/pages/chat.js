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
                        Namaste! 🙏 I am your YatraSathi AI Assistant. How can I help you with your journey today?
                    </div>
                </div>

            </div>

            <!-- Input Area -->
            <div style="padding: 1.5rem; border-top: 1px solid #e2e8f0; background: var(--bg-surface); border-radius: 0 0 var(--radius-lg) var(--radius-lg);">
                <form id="chat-form" style="display: flex; gap: 1rem; align-items: center;">
                    <button type="button" id="btn-mic" style="background: none; border: none; cursor: pointer; color: var(--primary); padding: 0.5rem; border-radius: 50%; transition: all 0.3s; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background-color: rgba(37, 99, 235, 0.1);">
                        <i data-lucide="mic" id="icon-mic" style="width: 24px; height: 24px;"></i>
                    </button>
                    
                    <input type="text" id="chat-input" class="form-control" placeholder="Type or tap the microphone to speak..." style="flex: 1;" autocomplete="off" required>
                    
                    <button type="submit" class="btn-primary" id="btn-send" style="padding: 0 1.5rem; display: flex; align-items: center; justify-content: center; height: 48px;">
                        <i data-lucide="send"></i>
                    </button>
                </form>
            </div>
        </div>
    `;
    lucide.createIcons();

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
        
        // Try to find an English (India) voice if available
        const voices = window.speechSynthesis.getVoices();
        const indianVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('hi-IN'));
        if (indianVoice) {
            utterance.voice = indianVoice;
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
            btnMic.style.backgroundColor = '#fee2e2'; // Light red
            btnMic.style.color = '#dc2626'; // Dark red
            iconMic.setAttribute('data-lucide', 'mic'); // Can add pulse animation in CSS if wanted
            input.placeholder = "Listening...";
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
                // We dispatch a submit event instead of manually calling submit to ensure event listeners fire
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
        btnMic.style.backgroundColor = 'rgba(37, 99, 235, 0.1)';
        btnMic.style.color = 'var(--primary)';
        input.placeholder = "Type or tap the microphone to speak...";
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
            
            // Check for JSON payload for SEARCH action
            const jsonRegex = /```json\n([\s\S]*?)\n```/;
            const match = botText.match(jsonRegex);
            let shouldRedirectToPlanner = false;
            
            if (match && match[1]) {
                try {
                    const payload = JSON.parse(match[1]);
                    if (payload.action === "SEARCH") {
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
            history.innerHTML += `
                <div style="align-self: flex-start; max-width: 80%;">
                    <div style="background-color: #fee2e2; color: #991b1b; padding: 1rem 1.5rem; border-radius: 20px 20px 20px 0;">
                        Sorry, I encountered an error connecting to the backend. (${error.message})
                    </div>
                </div>
            `;
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
