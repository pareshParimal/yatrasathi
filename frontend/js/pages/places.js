import { api } from '../api.js';

export const renderPlaces = async (rootElement) => {
    rootElement.innerHTML = `
        <div class="dashboard-header">
            <h1>Discover India's Heritage</h1>
            <p>Explore rich history and culture through interactive storytelling.</p>
        </div>

        <div style="display: flex; gap: 1rem; margin-top: 2rem; margin-bottom: 2rem;">
            <select id="place-selector" class="form-control" style="max-width: 300px;">
                <option value="">Loading places...</option>
            </select>
            <button class="btn-primary" id="btn-load-place">Discover</button>
        </div>

        <div id="place-content-area" style="display: none;">
            <!-- Main Video / Animation area -->
            <div class="card" style="margin-bottom: 2rem; padding: 0; overflow: hidden; background: #000; display: flex; align-items: center; justify-content: center; height: 400px;">
                <div style="text-align: center; color: white;">
                    <i data-lucide="play-circle" style="width: 64px; height: 64px; opacity: 0.8; margin-bottom: 1rem; cursor: pointer;"></i>
                    <h3>Historical Animation Video</h3>
                    <p style="opacity: 0.7;">Click to play the interactive story</p>
                </div>
            </div>

            <!-- Place Details -->
            <div class="card" id="place-info">
                <h2 id="place-title">Place Title</h2>
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; margin-top: 1.5rem;">
                    <div>
                        <h3>History</h3>
                        <p id="place-history" style="color: var(--text-muted); line-height: 1.8;">Loading history...</p>
                        
                        <h3 style="margin-top: 1.5rem;">Cultural Significance</h3>
                        <p id="place-culture" style="color: var(--text-muted); line-height: 1.8;">Loading culture...</p>
                    </div>
                    <div style="background: rgba(37, 99, 235, 0.05); padding: 1.5rem; border-radius: var(--radius-md);">
                        <h3>Weather Details</h3>
                        <div id="weather-info" style="margin-top: 1rem;">Loading...</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    lucide.createIcons();

    // Fetch places for the dropdown
    try {
        const places = await api.getPlaces();
        const selector = document.getElementById('place-selector');
        if (places && places.length > 0) {
            selector.innerHTML = places.map(p => `<option value="${p.id}">${p.name}, ${p.state}</option>`).join('');
        } else {
            selector.innerHTML = '<option value="">No places available in DB yet</option>';
        }
    } catch (e) {
        document.getElementById('place-selector').innerHTML = '<option value="">Error loading places</option>';
    }

    // Load place details on click
    document.getElementById('btn-load-place').addEventListener('click', async () => {
        const placeId = document.getElementById('place-selector').value;
        if(!placeId) return alert('Select a place first.');
        
        const btn = document.getElementById('btn-load-place');
        btn.innerHTML = 'Loading...';
        btn.disabled = true;

        try {
            // Fetch content and weather in parallel
            const [contentList, weather] = await Promise.all([
                api.getPlaceContent(placeId),
                api.getWeather(placeId)
            ]);

            document.getElementById('place-content-area').style.display = 'block';
            const selectedPlaceName = document.getElementById('place-selector').options[document.getElementById('place-selector').selectedIndex].text.split(',')[0];
            
            // Populate content
            let dataNode = {};
            if (contentList && contentList.length > 0) {
                const content = contentList[0];
                dataNode = content.content || {};
                
                document.getElementById('place-title').innerText = content.title || 'Historical Overview';
                document.getElementById('place-history').innerText = dataNode.historical || dataNode.historicalText || 'No history available.';
                document.getElementById('place-culture').innerText = dataNode.cultural || dataNode.culturalText || 'No cultural info available.';
                
                // Add TTS Audio Guide button
                const existingBtn = document.getElementById('btn-audio-guide');
                if(existingBtn) existingBtn.remove();
                
                const ttsHtml = `
                    <button class="btn-primary" id="btn-audio-guide" style="margin-top: 1.5rem; background: var(--accent); color: white; display: flex; align-items: center; gap: 8px; font-size: 1.1rem; padding: 0.75rem 1.5rem; border-radius: 50px;">
                        <i data-lucide="volume-2"></i> Listen to Audio Guide
                    </button>
                `;
                
                document.getElementById('place-culture').insertAdjacentHTML('afterend', ttsHtml);
                lucide.createIcons();
                
                document.getElementById('btn-audio-guide').addEventListener('click', () => {
                    const history = dataNode.historical || dataNode.historicalText || '';
                    const culture = dataNode.cultural || dataNode.culturalText || '';
                    const textToRead = `Welcome to ${selectedPlaceName}. ${history} ${culture}`;
                    const utterance = new SpeechSynthesisUtterance(textToRead);
                    utterance.rate = 0.85; // Slower for elderly
                    window.speechSynthesis.cancel();
                    window.speechSynthesis.speak(utterance);
                });
            } else {
                document.getElementById('place-history').innerText = 'No storytelling content available.';
                document.getElementById('place-culture').innerText = '';
                document.getElementById('place-title').innerText = 'Information Unavailable';
            }

            // Populate weather
            if (weather && weather.weather && weather.weather.main) {
                const temp = weather.weather.main.temp;
                const desc = weather.weather.weather && weather.weather.weather.length > 0 ? weather.weather.weather[0].description : 'Clear';
                const advice = weather.clothingAdvice ? weather.clothingAdvice.join(' ') : 'Wear comfortable clothes.';
                
                document.getElementById('weather-info').innerHTML = `
                    <div style="font-size: 2.5rem; font-weight: 700; color: var(--primary);">${temp}°C</div>
                    <p style="font-weight: 500; text-transform: capitalize; font-size: 1.1rem; color: var(--text-main);">${desc}</p>
                    
                    <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #cbd5e1;">
                        <strong style="color: var(--text-main); font-size: 1.1rem;">Clothing Recommendation:</strong>
                        <p style="margin-top: 0.5rem; color: var(--text-muted); font-size: 1rem; line-height: 1.6;">${advice}</p>
                    </div>
                `;
            } else {
                document.getElementById('weather-info').innerHTML = '<p>Weather data unavailable.</p>';
            }
            
            // Map of city names to high quality documentary YouTube embedded iframes
            const videoMap = {
                "Mahabalipuram": `https://www.youtube.com/embed/nbRmsHPFIKo`,
                "Agra": `https://www.youtube.com/embed/g1Z4eSq6AAw`,
                "New Delhi": `https://www.youtube.com/embed/OzRU1cyDvuU`,
                "Gwalior": `https://www.youtube.com/embed/p-HFXV6dMD8`,
                "Mathura": `https://www.youtube.com/embed/btyq3WcYd-I`,
                "Hampi Temples": `https://www.youtube.com/embed/Lf7zki_sjvU`,
                "Chola Temples": `https://www.youtube.com/embed/YsOe9cKEASI`,
                "Meenakshi Temple": `https://www.youtube.com/embed/lnUU-GbXxaA`,
                "Jyotirlingas of Maharashtra": `https://www.youtube.com/embed/UO39dgB8gYo`,
                "Jyotirlingas of Gujarat": `https://www.youtube.com/embed/UO39dgB8gYo`,
                "Jyotirlingas of Madhya Pradesh": `https://www.youtube.com/embed/UO39dgB8gYo`,
                "Jyotirlingas of Uttar Pradesh": `https://www.youtube.com/embed/UO39dgB8gYo`,
                "Jyotirlingas of Uttarakhand": `https://www.youtube.com/embed/UO39dgB8gYo`,
                "Jyotirlingas of Jharkhand": `https://www.youtube.com/embed/UO39dgB8gYo`,
                "Jyotirlingas of Andhra Pradesh": `https://www.youtube.com/embed/UO39dgB8gYo`,
                "Jyotirlingas of Tamil Nadu": `https://www.youtube.com/embed/UO39dgB8gYo`
            };
            const videoUrl = videoMap[selectedPlaceName] || `https://www.youtube.com/embed/nbRmsHPFIKo`;
            
            const videoContainer = document.querySelector('.card[style*="height: 400px"]');
            if (videoContainer) {
                if (selectedPlaceName === "Mahabalipuram") {
                    // Cinematic Narrator Experiment
                    videoContainer.style.padding = '0'; // Remove card padding
                    videoContainer.innerHTML = `
                        <div class="cinematic-container" id="cinematic-container">
                            <!-- Slides -->
                            <div class="cinematic-slide active" style="background-image: url('https://upload.wikimedia.org/wikipedia/commons/4/4e/Shore_Temple_Mahabalipuram.jpg');"></div>
                            <div class="cinematic-slide" style="background-image: url('https://upload.wikimedia.org/wikipedia/commons/7/77/Five_Rathas_Mahabalipuram.jpg');"></div>
                            <div class="cinematic-slide" style="background-image: url('https://upload.wikimedia.org/wikipedia/commons/6/6f/Krishna_Mandapam_Mahabalipuram.jpg');"></div>
                            
                            <!-- Overlay -->
                            <div class="cinematic-overlay">
                                <div class="cinematic-caption" id="cinematic-caption"></div>
                            </div>
                            
                            <!-- Controls -->
                            <div class="cinematic-controls">
                                <button class="cinematic-btn" id="btn-cinematic-play" title="Play Narration">
                                    <i data-lucide="play" style="width:20px;height:20px;color:white;fill:white;"></i>
                                </button>
                                <button class="cinematic-btn" id="btn-cinematic-stop" title="Stop">
                                    <i data-lucide="square" style="width:16px;height:16px;color:white;fill:white;"></i>
                                </button>
                            </div>
                        </div>
                    `;
                    lucide.createIcons();
                    
                    const history = dataNode.historical || dataNode.historicalText || '';
                    const culture = dataNode.cultural || dataNode.culturalText || '';
                    const fullText = (history + " " + culture).replace(/([.?!])\s*(?=[A-Z])/g, "$1|").split("|").filter(s => s.trim().length > 0);
                    
                    let currentSentence = 0;
                    let currentSlide = 0;
                    let isPlaying = false;
                    
                    const slides = videoContainer.querySelectorAll('.cinematic-slide');
                    const caption = document.getElementById('cinematic-caption');
                    const playBtn = document.getElementById('btn-cinematic-play');
                    const stopBtn = document.getElementById('btn-cinematic-stop');
                    
                    const speakNext = () => {
                        if (!isPlaying || currentSentence >= fullText.length) {
                            isPlaying = false;
                            caption.classList.remove('show');
                            return;
                        }
                        
                        const text = fullText[currentSentence];
                        caption.innerText = text;
                        caption.classList.add('show');
                        
                        // Rotate slide every 2 sentences
                        if (currentSentence % 2 === 0 && currentSentence !== 0) {
                            slides.forEach(s => s.classList.remove('active'));
                            currentSlide = (currentSlide + 1) % slides.length;
                            slides[currentSlide].classList.add('active');
                        }
                        
                        const utterance = new SpeechSynthesisUtterance(text);
                        utterance.rate = 0.9;
                        
                        utterance.onend = () => {
                            currentSentence++;
                            caption.classList.remove('show');
                            setTimeout(speakNext, 400); // slight pause between sentences
                        };
                        
                        utterance.onerror = (e) => {
                            console.error("Speech error", e);
                            isPlaying = false;
                        };
                        
                        window.speechSynthesis.speak(utterance);
                    };
                    
                    playBtn.addEventListener('click', () => {
                        window.speechSynthesis.cancel();
                        if (isPlaying) {
                            isPlaying = false;
                            playBtn.innerHTML = '<i data-lucide="play" style="width:20px;height:20px;color:white;fill:white;"></i>';
                        } else {
                            isPlaying = true;
                            playBtn.innerHTML = '<i data-lucide="pause" style="width:20px;height:20px;color:white;fill:white;"></i>';
                            if (currentSentence >= fullText.length) currentSentence = 0; // Restart if at end
                            speakNext();
                        }
                        lucide.createIcons();
                    });
                    
                    stopBtn.addEventListener('click', () => {
                        window.speechSynthesis.cancel();
                        isPlaying = false;
                        currentSentence = 0;
                        caption.classList.remove('show');
                        playBtn.innerHTML = '<i data-lucide="play" style="width:20px;height:20px;color:white;fill:white;"></i>';
                        lucide.createIcons();
                    });
                    
                } else {
                    videoContainer.innerHTML = `<iframe width="100%" height="100%" src="${videoUrl}?autoplay=1&mute=1&rel=0&showinfo=0&modestbranding=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="border-radius: var(--radius-md);"></iframe>`;
                }
            }

        } catch (error) {
            alert('Failed to load place details: ' + error.message);
        } finally {
            btn.innerHTML = 'Discover';
            btn.disabled = false;
        }
    });
};
