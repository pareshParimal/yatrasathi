import { api } from '../api.js';

// ─── Voice Input Helper ───────────────────────────────────────────────────────
function attachVoiceInput(inputId, btnId) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { btn.style.display = 'none'; return; }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;

    btn.addEventListener('click', () => {
        btn.style.color = '#ef4444';
        btn.innerHTML = '<i data-lucide="mic" style="width:16px;height:16px;"></i>';
        lucide.createIcons();
        recognition.start();
    });
    recognition.onresult = (event) => {
        document.getElementById(inputId).value = event.results[0][0].transcript;
        btn.style.color = '';
    };
    recognition.onend = () => { btn.innerHTML = '<i data-lucide="mic" style="width:16px;height:16px;"></i>'; lucide.createIcons(); };
    recognition.onerror = () => { btn.style.color = ''; };
}

// ─── Main Render ─────────────────────────────────────────────────────────────
export const renderPlanner = async (rootElement) => {
    rootElement.innerHTML = `
        <div class="dashboard-header">
            <h1>Plan Your Journey</h1>
            <p>Tell us your preferences and we'll find the best trains and hotels for you.</p>
        </div>

        <!-- STEP 1: PREFERENCES -->
        <div id="step-1" style="margin-top: 2rem;">

            <!-- TRAIN SECTION -->
            <div class="card" style="margin-bottom: 1.5rem; border-left: 4px solid var(--primary);">
                <h2 style="display:flex; align-items:center; gap:10px; margin-bottom: 1.5rem;">
                    <i data-lucide="train" style="width:28px;height:28px;color:var(--primary);"></i> Train Preferences
                </h2>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">

                    <!-- From City -->
                    <div class="form-group">
                        <label for="sourceLocation" style="font-weight:bold;">🏠 Travelling From</label>
                        <div style="display:flex; gap:8px; align-items:center;">
                            <input type="text" id="sourceLocation" class="form-control" placeholder="e.g., New Delhi" required>
                            <button id="voice-from" title="Speak" style="background:var(--primary);color:#fff;border:none;border-radius:8px;padding:10px;cursor:pointer;flex-shrink:0;">
                                <i data-lucide="mic" style="width:16px;height:16px;"></i>
                            </button>
                        </div>
                    </div>

                    <!-- To City -->
                    <div class="form-group">
                        <label for="destination" style="font-weight:bold;">📍 Going To</label>
                        <select id="destination" class="form-control" required>
                            <option value="">Loading places...</option>
                        </select>
                    </div>

                    <!-- Travel Date -->
                    <div class="form-group">
                        <label for="travelDate" style="font-weight:bold;">📅 Travel Date</label>
                        <input type="date" id="travelDate" class="form-control" required>
                    </div>

                    <!-- Max Duration -->
                    <div class="form-group">
                        <label for="maxDuration" style="font-weight:bold;">⏱️ Max Journey Duration</label>
                        <select id="maxDuration" class="form-control">
                            <option value="6">Up to 6 Hours</option>
                            <option value="10" selected>Up to 10 Hours</option>
                            <option value="15">Up to 15 Hours</option>
                            <option value="24">Any Duration</option>
                        </select>
                    </div>

                    <!-- Departure Window -->
                    <div class="form-group" style="grid-column: span 2;">
                        <label style="font-weight:bold;">🕐 Preferred Departure Time</label>
                        <p style="font-size:0.85rem; color:#6b7280; margin: 4px 0 12px;">
                            Tap a quick option, or set your own range below.
                        </p>
                        <!-- Quick-fill chips -->
                        <div id="time-chips" style="display:flex; flex-wrap:wrap; gap:10px; margin-bottom: 1rem;">
                            <button class="time-chip" data-from="05:00" data-to="10:00"
                                style="padding: 10px 18px; border-radius: 999px; border: 2px solid var(--primary); background: transparent; color: var(--primary); font-size: 1rem; cursor: pointer; font-weight:600;">
                                🌅 Early Morning (5–10 AM)
                            </button>
                            <button class="time-chip" data-from="10:00" data-to="16:00"
                                style="padding: 10px 18px; border-radius: 999px; border: 2px solid var(--primary); background: transparent; color: var(--primary); font-size: 1rem; cursor: pointer; font-weight:600;">
                                ☀️ Afternoon (10 AM–4 PM)
                            </button>
                            <button class="time-chip" data-from="16:00" data-to="21:00"
                                style="padding: 10px 18px; border-radius: 999px; border: 2px solid var(--primary); background: transparent; color: var(--primary); font-size: 1rem; cursor: pointer; font-weight:600;">
                                🌇 Evening (4–9 PM)
                            </button>
                            <button class="time-chip" data-from="21:00" data-to="23:59"
                                style="padding: 10px 18px; border-radius: 999px; border: 2px solid var(--primary); background: transparent; color: var(--primary); font-size: 1rem; cursor: pointer; font-weight:600;">
                                🌙 Night (9 PM+)
                            </button>
                            <button class="time-chip" data-from="00:00" data-to="23:59"
                                style="padding: 10px 18px; border-radius: 999px; border: 2px solid #9ca3af; background: transparent; color: #6b7280; font-size: 1rem; cursor: pointer; font-weight:600;">
                                🕐 Any Time
                            </button>
                        </div>
                        <div style="display:flex; gap:1rem; align-items:center; flex-wrap:wrap;">
                            <div class="form-group" style="margin:0; flex:1;">
                                <label for="departureFrom" style="font-size:0.85rem;">Depart After</label>
                                <input type="time" id="departureFrom" class="form-control" value="00:00">
                            </div>
                            <div class="form-group" style="margin:0; flex:1;">
                                <label for="departureTo" style="font-size:0.85rem;">Depart Before</label>
                                <input type="time" id="departureTo" class="form-control" value="23:59">
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <!-- HOTEL SECTION -->
            <div class="card" style="margin-bottom: 1.5rem; border-left: 4px solid #f97316;">
                <h2 style="display:flex; align-items:center; gap:10px; margin-bottom: 1.5rem;">
                    <i data-lucide="hotel" style="width:28px;height:28px;color:#f97316;"></i> Hotel Preferences
                </h2>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">

                    <!-- Near Famous Site -->
                    <div class="form-group">
                        <label for="hotelNearSite" style="font-weight:bold;">🗺️ Stay Near</label>
                        <p style="font-size:0.85rem; color:#6b7280; margin: 4px 0 8px;">
                            Hotels will be searched close to this landmark.
                        </p>
                        <select id="hotelNearSite" class="form-control">
                            <option value="">Near Destination Center</option>
                        </select>
                    </div>

                    <!-- Hotel Radius -->
                    <div class="form-group">
                        <label for="hotelRadius" style="font-weight:bold;">📏 Search Radius from Landmark</label>
                        <select id="hotelRadius" class="form-control">
                            <option value="2">Within 2 km</option>
                            <option value="5" selected>Within 5 km</option>
                            <option value="10">Within 10 km</option>
                        </select>
                    </div>

                    <!-- Max Hotel Price -->
                    <div class="form-group" style="grid-column: span 2;">
                        <label style="font-weight:bold;">💰 Max Budget Per Night</label>
                        <div id="price-chips" style="display:flex; flex-wrap:wrap; gap:10px; margin-top: 12px;">
                            <button class="price-chip" data-price="2000"
                                style="padding: 10px 22px; border-radius: 999px; border: 2px solid #f97316; background: transparent; color: #f97316; font-size: 1rem; cursor: pointer; font-weight:600;">
                                ₹2,000
                            </button>
                            <button class="price-chip" data-price="5000"
                                style="padding: 10px 22px; border-radius: 999px; border: 2px solid #f97316; background: transparent; color: #f97316; font-size: 1rem; cursor: pointer; font-weight:600;">
                                ₹5,000
                            </button>
                            <button class="price-chip" data-price="10000"
                                style="padding: 10px 22px; border-radius: 999px; border: 2px solid #f97316; background: transparent; color: #f97316; font-size: 1rem; cursor: pointer; font-weight:600;">
                                ₹10,000
                            </button>
                            <button class="price-chip" data-price="0"
                                style="padding: 10px 22px; border-radius: 999px; border: 2px solid #9ca3af; background: transparent; color: #6b7280; font-size: 1rem; cursor: pointer; font-weight:600;">
                                No Limit
                            </button>
                        </div>
                        <input type="hidden" id="maxHotelPrice" value="0">
                    </div>

                </div>
            </div>

            <!-- OTHER PREFERENCES -->
            <div class="card" style="margin-bottom: 1.5rem;">
                <h2 style="display:flex; align-items:center; gap:10px; margin-bottom: 1.5rem;">
                    <i data-lucide="settings-2" style="width:24px;height:24px;color:var(--primary);"></i> Other Preferences
                </h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                    <div class="form-group">
                        <label for="budgetMin" style="font-weight:bold;">💵 Train Min Budget (₹)</label>
                        <input type="number" id="budgetMin" class="form-control" value="1000">
                    </div>
                    <div class="form-group">
                        <label for="budgetMax" style="font-weight:bold;">💵 Train Max Budget (₹)</label>
                        <input type="number" id="budgetMax" class="form-control" value="5000">
                    </div>
                    <div class="form-group">
                        <label for="foodPreference" style="font-weight:bold;">🍽️ Food Preference</label>
                        <select id="foodPreference" class="form-control">
                            <option value="VEG">🥗 Vegetarian</option>
                            <option value="NON_VEG">🍗 Non-Vegetarian</option>
                            <option value="JAIN">🌿 Jain</option>
                            <option value="VEGAN">🌱 Vegan</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="specialReqs" style="font-weight:bold;">♿ Special Requirements</label>
                        <div style="display:flex; gap:8px; align-items:center;">
                            <input type="text" id="specialReqs" class="form-control" placeholder="e.g., Wheelchair access">
                            <button id="voice-special" title="Speak" style="background:var(--primary);color:#fff;border:none;border-radius:8px;padding:10px;cursor:pointer;flex-shrink:0;">
                                <i data-lucide="mic" style="width:16px;height:16px;"></i>
                            </button>
                        </div>
                    </div>
                    <div class="form-group" style="grid-column: span 2; background: #eef2ff; padding: 1rem; border-radius: 8px;">
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-weight: bold; color: var(--primary);">
                            <input type="checkbox" id="shareTelegram" style="width: 1.2rem; height: 1.2rem;">
                            📡 Enable Safety Tracking (Share location via Telegram)
                        </label>
                        <div id="interval-container" style="display: none; margin-top: 1rem;">
                            <label for="shareInterval">Update Frequency</label>
                            <select id="shareInterval" class="form-control" style="max-width: 200px;">
                                <option value="1">Every 1 Hour</option>
                                <option value="2">Every 2 Hours</option>
                                <option value="5">Every 5 Hours</option>
                                <option value="12">Every 12 Hours</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div style="margin-top: 2rem; text-align:center;">
                    <button id="btn-search" class="btn-primary" style="padding: 1rem 3rem; font-size: 1.1rem; display: inline-flex; align-items: center; gap: 10px;">
                        <i data-lucide="search"></i> Find Trains & Hotels
                    </button>
                </div>
            </div>
        </div>

        <!-- STEP 2: RESULTS -->
        <div id="step-2" style="display: none; margin-top: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items:center; margin-bottom: 1rem; flex-wrap:wrap; gap:1rem;">
                <h2 id="step2-title">Step 2: Select Your Train & Hotel</h2>
                <button id="btn-back" class="btn-secondary" style="display:flex;align-items:center;gap:8px;">
                    <i data-lucide="arrow-left"></i> Edit Preferences
                </button>
            </div>

            <!-- Train Results -->
            <div class="card" style="margin-bottom: 1.5rem; border-left: 4px solid var(--primary);">
                <h3 style="display:flex;align-items:center;gap:10px;"><i data-lucide="train"></i> Available Trains</h3>
                <p id="train-route-label" style="color:#6b7280; margin-bottom:1rem;"></p>
                <div id="train-options" style="display: flex; flex-direction: column; gap: 1rem; margin-top:1rem;"></div>
            </div>

            <!-- Hotel Results -->
            <div class="card" style="margin-bottom: 1.5rem; border-left: 4px solid #f97316;">
                <h3 style="display:flex;align-items:center;gap:10px;"><i data-lucide="hotel"></i> Available Hotels</h3>
                <p id="hotel-location-label" style="color:#6b7280; margin-bottom:1rem;"></p>
                <div id="hotel-options" style="display: flex; flex-direction: column; gap: 1rem; margin-top:1rem;"></div>
            </div>

            <div style="text-align: center; margin-top: 2rem;">
                <button class="btn-primary" id="btn-confirm-booking" style="padding: 1rem 2.5rem; font-size: 1.1rem; display: inline-flex; align-items: center; gap: 8px;">
                    <i data-lucide="check-circle"></i> Confirm Booking & Generate Itinerary
                </button>
            </div>
        </div>

        <!-- STEP 3: RESULT & TRACKING -->
        <div id="step-3" style="display: none; margin-top: 2rem;">
            <div id="booking-success" style="background-color: #dcfce7; color: #166534; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; border: 1px solid #bbf7d0;">
                <h3 style="margin-top: 0; display: flex; align-items: center; gap: 8px;"><i data-lucide="party-popper"></i> Booking Confirmed!</h3>
                <p style="font-size: 1.1rem; margin-bottom: 0.5rem;"><strong>PNR Number: <span id="display-pnr" style="font-family: monospace; font-size: 1.3rem; background: #fff; padding: 0.2rem 0.5rem; border-radius: 4px;"></span></strong></p>
                <p>Train: <span id="display-train"></span> | Hotel: <span id="display-hotel"></span></p>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h2>Your AI-Generated Itinerary</h2>
                <div style="display: flex; gap: 1rem;">
                    <button class="btn-primary" id="btn-order-food" style="display: none; align-items: center; gap: 8px; background-color: #f97316;">
                        <i data-lucide="utensils"></i> Order Train Food
                    </button>
                    <button class="btn-primary" id="btn-start-journey" style="display: flex; align-items: center; gap: 8px; background-color: #ef4444;">
                        <i data-lucide="navigation"></i> Start Journey
                    </button>
                </div>
            </div>

            <div id="itinerary-content" class="card">
                <div style="text-align: center; padding: 3rem;"><i data-lucide="loader-2" class="lucide-spin" style="width: 48px; height: 48px; color: var(--primary);"></i><p>AI is crafting your itinerary...</p></div>
            </div>
        </div>

        <!-- FOOD MODAL -->
        <div id="food-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;">
            <div class="card" style="width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto; background: white;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 1rem; margin-bottom: 1rem;">
                    <h2 style="margin: 0; color: #ea580c; display: flex; align-items: center; gap: 8px;"><i data-lucide="utensils"></i> eCatering: Food on Track</h2>
                    <button id="close-food-modal" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
                </div>
                <div id="food-modal-body"></div>
            </div>
        </div>
    `;
    lucide.createIcons();

    // ─── State ────────────────────────────────────────────────────────────────
    let currentPlanId = null;
    let shareTelegramEnabled = false;
    let generatedPnr = null;
    let trainFoodData = null;
    let selectedLandmark = null; // { lat, lng, name }
    let placesData = [];

    // ─── Set default date to tomorrow ─────────────────────────────────────────
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('travelDate').value = tomorrow.toISOString().split('T')[0];

    // ─── Load places ──────────────────────────────────────────────────────────
    try {
        placesData = await api.getPlaces();
        const destSelect = document.getElementById('destination');
        if (placesData && placesData.length > 0) {
            destSelect.innerHTML = placesData.map(p => `<option value="${p.id}" data-name="${p.name}" data-lat="${p.latitude}" data-lng="${p.longitude}">${p.name}, ${p.state}</option>`).join('');
        } else {
            destSelect.innerHTML = '<option value="">No places available</option>';
        }
        // Update landmark dropdown on destination change
        destSelect.addEventListener('change', updateLandmarkDropdown);
        updateLandmarkDropdown();
    } catch (e) {
        document.getElementById('destination').innerHTML = '<option value="">Error loading places</option>';
    }

    function updateLandmarkDropdown() {
        const destSelect = document.getElementById('destination');
        const selected = destSelect.options[destSelect.selectedIndex];
        const nearSiteSelect = document.getElementById('hotelNearSite');
        // For now we offer destination center as well as landmark options
        // In a real app, we'd fetch place_highlights from API
        const destName = selected ? selected.getAttribute('data-name') : 'Destination';
        nearSiteSelect.innerHTML = `
            <option value="" data-lat="" data-lng="">Near ${destName} Center</option>
            <option value="railway_station" data-lat="" data-lng="">Near Railway Station</option>
            <option value="temple" data-lat="" data-lng="">Near Main Temple/Monument</option>
            <option value="market" data-lat="" data-lng="">Near Local Market</option>
        `;
    }

    // ─── Voice Input ──────────────────────────────────────────────────────────
    attachVoiceInput('sourceLocation', 'voice-from');
    attachVoiceInput('specialReqs', 'voice-special');

    // ─── Time chips ───────────────────────────────────────────────────────────
    document.querySelectorAll('.time-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.time-chip').forEach(c => {
                c.style.background = 'transparent';
                c.style.color = c.dataset.from === '00:00' ? '#6b7280' : 'var(--primary)';
                c.style.borderColor = c.dataset.from === '00:00' ? '#9ca3af' : 'var(--primary)';
            });
            chip.style.background = 'var(--primary)';
            chip.style.color = '#fff';
            chip.style.borderColor = 'var(--primary)';
            document.getElementById('departureFrom').value = chip.dataset.from;
            document.getElementById('departureTo').value = chip.dataset.to;
        });
    });

    // ─── Price chips ──────────────────────────────────────────────────────────
    document.querySelectorAll('.price-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.price-chip').forEach(c => {
                c.style.background = 'transparent';
                c.style.color = c.dataset.price === '0' ? '#6b7280' : '#f97316';
                c.style.borderColor = c.dataset.price === '0' ? '#9ca3af' : '#f97316';
            });
            chip.style.background = '#f97316';
            chip.style.color = '#fff';
            chip.style.borderColor = '#f97316';
            document.getElementById('maxHotelPrice').value = chip.dataset.price;
        });
    });

    // ─── Telegram checkbox ────────────────────────────────────────────────────
    document.getElementById('shareTelegram').addEventListener('change', (e) => {
        document.getElementById('interval-container').style.display = e.target.checked ? 'block' : 'none';
    });

    // ─── STEP 1: Search ───────────────────────────────────────────────────────
    document.getElementById('btn-search').addEventListener('click', async () => {
        const btn = document.getElementById('btn-search');
        const fromCity = document.getElementById('sourceLocation').value.trim();
        const destSelect = document.getElementById('destination');
        const selectedOpt = destSelect.options[destSelect.selectedIndex];
        const toCity = selectedOpt ? selectedOpt.getAttribute('data-name') : '';

        if (!fromCity) { alert('Please enter where you are travelling from.'); return; }
        if (!destSelect.value) { alert('Please select a destination.'); return; }

        btn.innerHTML = '<i data-lucide="loader-2" class="lucide-spin"></i> Searching...';
        btn.disabled = true;
        lucide.createIcons();

        shareTelegramEnabled = document.getElementById('shareTelegram').checked;

        try {
            // 1. Create Travel Plan
            const planPayload = {
                sourceLocation: fromCity,
                destinationId: destSelect.value,
                travelMedium: 'TRAIN',
                travelDate: document.getElementById('travelDate').value,
                budgetMin: parseFloat(document.getElementById('budgetMin').value) || 1000,
                budgetMax: parseFloat(document.getElementById('budgetMax').value) || 5000,
                foodPreference: document.getElementById('foodPreference').value,
                specialRequirements: document.getElementById('specialReqs').value,
                shareLocationTelegram: shareTelegramEnabled,
                locationShareIntervalHours: parseInt(document.getElementById('shareInterval').value) || 2
            };
            const plan = await api.createTravelPlan(planPayload);
            currentPlanId = plan.id;

            // Transition to step 2 IMMEDIATELY with Skeleton Loaders
            document.getElementById('step-1').style.display = 'none';
            document.getElementById('step-2').style.display = 'block';
            window.scrollTo(0, 0);

            // Shimmer CSS (injected if not present)
            if (!document.getElementById('shimmer-css')) {
                const style = document.createElement('style');
                style.id = 'shimmer-css';
                style.innerHTML = `
                    @keyframes shimmer {
                        0% { background-position: -1000px 0; }
                        100% { background-position: 1000px 0; }
                    }
                    .skeleton {
                        background: #f6f7f8;
                        background-image: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%);
                        background-repeat: no-repeat;
                        background-size: 1000px 100%;
                        animation-duration: 1.5s;
                        animation-fill-mode: forwards;
                        animation-iteration-count: infinite;
                        animation-name: shimmer;
                        animation-timing-function: linear;
                        border-radius: 4px;
                    }
                `;
                document.head.appendChild(style);
            }

            const skeletonTrain = `
                <div style="padding:1.2rem; border:2px solid #e5e7eb; border-radius:12px; margin-bottom:1rem; display:flex; gap:1rem;">
                    <div class="skeleton" style="width:20px; height:20px; border-radius:50%; margin-top:4px;"></div>
                    <div style="flex:1;">
                        <div class="skeleton" style="width: 60%; height: 24px; margin-bottom: 8px;"></div>
                        <div class="skeleton" style="width: 40%; height: 20px; margin-bottom: 8px;"></div>
                        <div class="skeleton" style="width: 80%; height: 16px;"></div>
                    </div>
                </div>
            `;
            const skeletonHotel = `
                <div style="padding:1.2rem; border:2px solid #e5e7eb; border-radius:12px; margin-bottom:1rem; display:flex; gap:1rem;">
                    <div class="skeleton" style="width:20px; height:20px; border-radius:50%; margin-top:4px;"></div>
                    <div style="flex:1;">
                        <div class="skeleton" style="width: 50%; height: 24px; margin-bottom: 8px;"></div>
                        <div class="skeleton" style="width: 70%; height: 16px; margin-bottom: 8px;"></div>
                        <div class="skeleton" style="width: 30%; height: 20px;"></div>
                    </div>
                </div>
            `;

            document.getElementById('train-route-label').innerHTML = `<span style="color:#f97316;">✨ AI is analyzing train schedules for ${fromCity} to ${toCity}...</span>`;
            document.getElementById('hotel-location-label').innerHTML = `<span style="color:#f97316;">✨ AI is finding the best hotels near ${toCity}...</span>`;
            
            document.getElementById('train-options').innerHTML = skeletonTrain + skeletonTrain + skeletonTrain;
            document.getElementById('hotel-options').innerHTML = skeletonHotel + skeletonHotel + skeletonHotel;
            lucide.createIcons();

            // 2. Fetch trains and hotels in parallel (takes 4-8 seconds via Gemini)
            const travelDate = document.getElementById('travelDate').value;
            const departureFrom = document.getElementById('departureFrom').value;
            const departureTo = document.getElementById('departureTo').value;
            const maxDuration = document.getElementById('maxDuration').value;
            const maxHotelPrice = document.getElementById('maxHotelPrice').value;
            const hotelRadius = document.getElementById('hotelRadius').value;

            const [trains, hotels] = await Promise.all([
                api.searchTrains({ fromCity, toCity, travelDate, departureFrom, departureTo, maxDurationHours: maxDuration }),
                api.searchHotels({ destinationId: destSelect.value, maxPricePerNight: maxHotelPrice > 0 ? maxHotelPrice : undefined, radiusKm: hotelRadius })
            ]);

            // 3. Render real trains
            document.getElementById('train-route-label').textContent = `${fromCity} → ${toCity} on ${travelDate}`;
            document.getElementById('train-options').innerHTML = trains.length === 0
                ? '<p style="color:#9ca3af; padding:1rem;">No trains found matching your criteria. Try broadening the time window or duration.</p>'
                : trains.map((t, i) => `
                    <label style="display:flex; gap:1rem; padding:1.2rem; border:2px solid ${i===0?'var(--primary)':'#e5e7eb'}; border-radius:12px; cursor:pointer; align-items:flex-start; background:${i===0?'#eef2ff':'white'}; transition:all 0.2s;">
                        <input type="radio" name="trainSelection" value="${t.name||t.id}" data-train-id="${t.id||t.number}" ${i===0?'checked':''} style="margin-top:4px;">
                        <div style="flex:1;">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.5rem;">
                                <div>
                                    <strong style="font-size:1.1rem;">${t.name}</strong>
                                    <span style="margin-left:8px; font-size:0.85rem; color:#6b7280;">#${t.number||t.id}</span>
                                </div>
                                
                            </div>
                            <div style="display:flex; gap:2rem; margin-top:0.5rem; flex-wrap:wrap;">
                                <span style="font-size:1.2rem; font-weight:bold; color:var(--primary);">${t.departure} → ${t.arrival}</span>
                                <span style="color:#6b7280; font-size:0.9rem; align-self:center;">⏱ ${t.duration}</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; margin-top:0.5rem; align-items:center; flex-wrap:wrap; gap:0.5rem;">
                                <div style="display:flex; gap:6px; flex-wrap:wrap;">
                                    ${(t.classes||['SL','3A']).map(c=>`<span style="background:#e0e7ff; color:#3730a3; font-size:0.78rem; padding:2px 8px; border-radius:4px; font-weight:600;">${c}</span>`).join('')}
                                </div>
                                
                            </div>
                        </div>
                    </label>
                `).join('');

            // 4. Render hotels
            document.getElementById('hotel-location-label').textContent = `Hotels near ${toCity}`;
            document.getElementById('hotel-options').innerHTML = hotels.length === 0
                ? '<p style="color:#9ca3af; padding:1rem;">No hotels found in this price range. Try increasing the budget.</p>'
                : hotels.map((h, i) => `
                    <label style="display:flex; gap:1rem; padding:1.2rem; border:2px solid ${i===0?'#f97316':'#e5e7eb'}; border-radius:12px; cursor:pointer; align-items:flex-start; background:${i===0?'#fff7ed':'white'}; transition:all 0.2s;">
                        <input type="radio" name="hotelSelection" value="${h.name}" ${i===0?'checked':''} style="margin-top:4px;">
                        <div style="flex:1;">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.5rem;">
                                <strong style="font-size:1.1rem;">${h.name}</strong>
                                <span style="background:#fef08a; padding:2px 10px; border-radius:4px; font-size:0.85rem;">⭐ ${h.rating||'4.0'}</span>
                            </div>
                            <p style="margin:4px 0; font-size:0.9rem; color:#6b7280;">📍 ${h.nearDescription||h.vicinity||'City Center'}</p>
                            <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:6px;">
                                ${(h.amenities||[]).map(a=>`<span style="background:#f3f4f6; color:#374151; font-size:0.78rem; padding:2px 8px; border-radius:4px;">${a}</span>`).join('')}
                            </div>
                            <p style="margin-top:8px; color:#f97316; font-weight:bold; font-size:1.1rem;">₹${h.price?.toLocaleString('en-IN')||'N/A'} <span style="font-size:0.8rem; color:#6b7280; font-weight:normal;">/ night</span>
                                <span style="margin-left:8px; background:#fff7ed; color:#c2410c; font-size:0.78rem; padding:2px 8px; border-radius:4px;">${h.priceCategory||''}</span>
                            </p>
                        </div>
                    </label>
                `).join('');

            lucide.createIcons();

        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            btn.innerHTML = '<i data-lucide="search"></i> Find Trains & Hotels';
            btn.disabled = false;
            lucide.createIcons();
        }
    });

    // Back button
    document.getElementById('btn-back').addEventListener('click', () => {
        document.getElementById('step-2').style.display = 'none';
        document.getElementById('step-1').style.display = 'block';
        window.scrollTo(0, 0);
    });

    // ─── STEP 2: Confirm Booking ──────────────────────────────────────────────
    document.getElementById('btn-confirm-booking').addEventListener('click', async (e) => {
        const btn = e.target.closest('button');
        btn.innerHTML = '<i data-lucide="loader-2" class="lucide-spin"></i> Confirming...';
        btn.disabled = true;
        lucide.createIcons();

        const selectedTrain = document.querySelector('input[name="trainSelection"]:checked')?.value;
        const selectedHotel = document.querySelector('input[name="hotelSelection"]:checked')?.value;

        try {
            const updatedPlan = await api.confirmBooking(currentPlanId, selectedTrain, selectedHotel);
            generatedPnr = updatedPlan.pnrNumber;

            document.getElementById('step-2').style.display = 'none';
            document.getElementById('step-3').style.display = 'block';

            document.getElementById('display-pnr').innerText = generatedPnr || 'PENDING';
            document.getElementById('display-train').innerText = selectedTrain;
            document.getElementById('display-hotel').innerText = selectedHotel;

            if (selectedTrain) {
                const foodBtn = document.getElementById('btn-order-food');
                foodBtn.style.display = 'flex';
            }

            // Generate itinerary in background
            api.generateItinerary(currentPlanId).then(() => {
                document.getElementById('itinerary-content').innerHTML = `
                    <div style="padding: 1rem;">
                        <p style="color: #166534;">✅ Itinerary successfully generated!</p>
                        <p>Click <b>Start Journey</b> when you are ready to begin tracking.</p>
                    </div>
                `;
            }).catch(err => {
                document.getElementById('itinerary-content').innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
            });

            window.scrollTo(0, 0);
            lucide.createIcons();
        } catch (err) {
            alert('Error confirming booking: ' + err.message);
            btn.innerHTML = '<i data-lucide="check-circle"></i> Confirm Booking & Generate Itinerary';
            btn.disabled = false;
            lucide.createIcons();
        }
    });

    // ─── STEP 3: Start Journey ────────────────────────────────────────────────
    document.getElementById('btn-start-journey').addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        btn.innerHTML = '<i data-lucide="check-circle"></i> Journey Active';
        btn.style.backgroundColor = '#16a34a';
        btn.disabled = true;
        lucide.createIcons();

        if (shareTelegramEnabled && currentPlanId) {
            alert('Safety Tracking Activated! Location will be shared periodically.');
            setInterval(() => {
                navigator.geolocation.getCurrentPosition((pos) => {
                    api.updateLocation(currentPlanId, pos.coords.latitude, pos.coords.longitude)
                        .catch(err => console.error("Tracking error:", err));
                });
            }, 10000);
        }
    });

    // ─── FOOD MODAL ───────────────────────────────────────────────────────────
    document.getElementById('close-food-modal').addEventListener('click', () => {
        document.getElementById('food-modal').style.display = 'none';
    });

    document.getElementById('btn-order-food').addEventListener('click', async () => {
        const modal = document.getElementById('food-modal');
        const modalBody = document.getElementById('food-modal-body');
        modal.style.display = 'flex';
        modalBody.innerHTML = '<div style="text-align: center; padding: 2rem;"><i data-lucide="loader-2" class="lucide-spin"></i> Fetching eCatering stations...</div>';
        lucide.createIcons();

        try {
            const pnrToUse = prompt("Enter a valid PNR to view real eCatering data (or leave blank for demo PNR)", "8937018601") || generatedPnr;
            const response = await api.getTrainFoodOptions(pnrToUse);
            trainFoodData = response.result;

            if (!trainFoodData || !trainFoodData.stations) throw new Error("No stations found for this PNR.");

            const stationsHtml = trainFoodData.stations
                .filter(s => s.outletCount > 0)
                .map(s => `
                    <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>${s.name} (${s.code})</strong>
                            <p style="margin: 0; color: #6b7280; font-size: 0.9rem;">Arrival: ${s.arrival} | Halt: ${s.halt} mins | Outlets: ${s.outletCount}</p>
                        </div>
                        <button class="btn-primary select-station-btn" data-station="${s.code}" data-pnr="${pnrToUse}" style="background-color: #ea580c;">View Menu</button>
                    </div>
                `).join('');

            modalBody.innerHTML = `<h3>Select a station for delivery</h3>${stationsHtml}`;

            document.querySelectorAll('.select-station-btn').forEach(btn => {
                btn.addEventListener('click', (e) => showTrendingItems(e.target.getAttribute('data-station'), e.target.getAttribute('data-pnr')));
            });
        } catch (err) {
            modalBody.innerHTML = `<div style="color: red; padding: 2rem; text-align: center;">Error: ${err.message}</div>`;
        }
    });

    const showTrendingItems = (stationCode, pnr) => {
        const modalBody = document.getElementById('food-modal-body');
        const items = trainFoodData.trendingItems.filter(item => item.availableAtStations.includes(stationCode));
        const station = trainFoodData.stations.find(s => s.code === stationCode);

        let itemsHtml = items.map(item => `
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: space-between;">
                <img src="${item.imageURL}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 50%; margin-bottom: 0.5rem;">
                <strong>${item.name}</strong>
                <button class="btn-primary place-mock-order-btn" style="margin-top: 1rem; width: 100%;"
                    data-pnr="${pnr}" data-station-code="${station.code}" data-station-name="${station.name}">Order Now</button>
            </div>
        `).join('');

        if (items.length === 0) itemsHtml = "<p>No trending items available here.</p>";

        modalBody.innerHTML = `
            <button class="btn-secondary" id="back-to-stations" style="margin-bottom: 1rem;"><i data-lucide="arrow-left"></i> Back</button>
            <h3>Trending at ${station.name}</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem;">${itemsHtml}</div>
        `;
        lucide.createIcons();

        document.getElementById('back-to-stations').addEventListener('click', () => document.getElementById('btn-order-food').click());

        document.querySelectorAll('.place-mock-order-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const button = e.target;
                button.innerHTML = '<i data-lucide="loader-2" class="lucide-spin"></i>';
                button.disabled = true;
                lucide.createIcons();

                const stationObj = trainFoodData.stations.find(s => s.code === button.getAttribute('data-station-code'));
                const orderPayload = {
                    "deliveryDetails": {
                        "berth": "33", "coach": "B3", "pnr": button.getAttribute('data-pnr'), "isSeatEdited": false,
                        "station": { "code": stationObj.code, "name": stationObj.name },
                        "train": { "name": trainFoodData.trainInfo.trainName, "number": trainFoodData.trainInfo.trainNo },
                        "delivery": { "date": stationObj.arrivalDate + " " + stationObj.arrival + " IST" }
                    },
                    "outlet": { "id": 62776362, "vendor": { "id": 6325397 } },
                    "customer": { "id": 62754654 }, "orderFrom": "desktop web",
                    "orderItems": [{ "itemId": "6661349138", "id": "6661349138", "quantity": 3 }],
                    "alternateMobileNumber": null, "gstin": null, "comment": null, "cartId": null,
                    "isReverseOrder": false,
                    "couponDetails": { "couponCode": null, "couponAutoApply": false },
                    "paymentDetails": { "paymentType": "PRE_PAID" }, "appliedSortMethod": "RATINGS"
                };

                try {
                    const orderRes = await api.placeFoodOrder(orderPayload);
                    if (orderRes.status === "failure") throw new Error(orderRes.message || "Order failed");
                    document.getElementById('food-modal-body').innerHTML = `
                        <div style="text-align: center; padding: 2rem;">
                            <div style="color: #16a34a; font-size: 4rem;"><i data-lucide="check-circle" style="width:64px;height:64px;"></i></div>
                            <h2 style="color: #16a34a;">Order Placed!</h2>
                            <p>eCatering Order ID: <strong>${orderRes.result.id}</strong></p>
                            <p>Your food will be delivered at ${button.getAttribute('data-station-name')}.</p>
                            <button class="btn-primary" onclick="document.getElementById('close-food-modal').click()" style="margin-top:2rem;">Close</button>
                        </div>`;
                    lucide.createIcons();
                } catch (err) {
                    alert("Order failed: " + err.message);
                    button.innerHTML = 'Order Now';
                    button.disabled = false;
                }
            });
        });
    };
};
