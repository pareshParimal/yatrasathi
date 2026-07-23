import { api } from '../api.js';

export const renderPlanner = async (rootElement) => {
    // Basic form HTML with wizard steps
    rootElement.innerHTML = `
        <div class="dashboard-header">
            <h1>Plan Your Trip</h1>
            <p>Tell us your preferences and we'll craft the perfect elderly-friendly itinerary.</p>
        </div>

        <!-- STEP 1: PREFERENCES -->
        <div id="step-1" class="card" style="margin-top: 2rem;">
            <h2>Step 1: Travel Preferences</h2>
            <form id="planner-form" style="margin-top: 1.5rem;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                    <div class="form-group">
                        <label for="sourceLocation">From (City)</label>
                        <input type="text" id="sourceLocation" class="form-control" placeholder="e.g., Delhi" required>
                    </div>

                    <div class="form-group">
                        <label for="destination">To (Destination)</label>
                        <select id="destination" class="form-control" required>
                            <option value="">Loading places...</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="travelMedium">Medium of Travel</label>
                        <select id="travelMedium" class="form-control" required>
                            <option value="TRAIN">Train</option>
                            <option value="FLIGHT">Flight</option>
                            <option value="BUS">Bus</option>
                            <option value="CAR">Car</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="budgetMin">Minimum Budget (₹)</label>
                        <input type="number" id="budgetMin" class="form-control" value="5000" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="budgetMax">Maximum Budget (₹)</label>
                        <input type="number" id="budgetMax" class="form-control" value="20000" required>
                    </div>

                    <div class="form-group">
                        <label for="foodPreference">Food Preference</label>
                        <select id="foodPreference" class="form-control" required>
                            <option value="VEG">Vegetarian</option>
                            <option value="NON_VEG">Non-Vegetarian</option>
                            <option value="JAIN">Jain</option>
                            <option value="VEGAN">Vegan</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="specialReqs">Special Requirements (e.g., Wheelchair)</label>
                        <input type="text" id="specialReqs" class="form-control" placeholder="Wheelchair access, ground floor only, etc.">
                    </div>

                    <div class="form-group" style="grid-column: span 2; background: #eef2ff; padding: 1rem; border-radius: 8px;">
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-weight: bold; color: var(--primary);">
                            <input type="checkbox" id="shareTelegram" style="width: 1.2rem; height: 1.2rem;">
                            Enable AI Safety Tracking (Telegram)
                        </label>
                        <p style="font-size: 0.9rem; color: #4b5563; margin-top: 0.5rem; margin-bottom: 0.5rem;">
                            Share your location periodically with your emergency contacts via an AI-generated safety message.
                        </p>
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

                <div style="margin-top: 2rem; display: flex; gap: 1rem;">
                    <button type="submit" class="btn-primary" id="btn-search" style="display: flex; align-items: center; gap: 8px;">
                        <i data-lucide="search"></i> Find Travel & Hotel Options
                    </button>
                </div>
            </form>
        </div>
        
        <!-- STEP 2: BOOKING OPTIONS -->
        <div id="step-2" style="display: none; margin-top: 2rem;">
            <h2>Step 2: Select Travel & Stay</h2>
            <p>We found these options based on your preferences.</p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 1.5rem;">
                <div class="card">
                    <h3>Available Trains</h3>
                    <div id="train-options" style="margin-top: 1rem; display: flex; flex-direction: column; gap: 1rem;"></div>
                </div>
                <div class="card">
                    <h3>Available Hotels</h3>
                    <div id="hotel-options" style="margin-top: 1rem; display: flex; flex-direction: column; gap: 1rem;"></div>
                </div>
            </div>

            <div style="margin-top: 2rem; text-align: center;">
                <button class="btn-primary" id="btn-confirm-booking" style="padding: 1rem 2rem; font-size: 1.1rem; display: inline-flex; align-items: center; gap: 8px;">
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
                    <button class="btn-primary" id="btn-order-food" style="display: flex; align-items: center; gap: 8px; background-color: #f97316; display: none;">
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
                
                <div id="food-modal-body">
                    <div style="text-align: center; padding: 2rem;"><i data-lucide="loader-2" class="lucide-spin"></i> Fetching stations...</div>
                </div>
            </div>
        </div>
    `;
    lucide.createIcons();

    let currentPlanId = null;
    let shareTelegramEnabled = false;
    let generatedPnr = null;
    let trainFoodData = null; // To store PNR response

    // Fetch available places for the dropdown
    try {
        const places = await api.getPlaces();
        const destSelect = document.getElementById('destination');
        if (places && places.length > 0) {
            destSelect.innerHTML = places.map(p => `<option value="${p.id}">${p.name}, ${p.state}</option>`).join('');
        } else {
            destSelect.innerHTML = '<option value="">No places available in DB yet</option>';
        }
    } catch (e) {
        document.getElementById('destination').innerHTML = '<option value="">Error loading places</option>';
    }

    // Toggle interval dropdown
    document.getElementById('shareTelegram').addEventListener('change', (e) => {
        document.getElementById('interval-container').style.display = e.target.checked ? 'block' : 'none';
    });

    // STEP 1: Search Options
    document.getElementById('planner-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = document.getElementById('btn-search');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i data-lucide="loader-2" class="lucide-spin"></i> Searching...';
        lucide.createIcons();
        btn.disabled = true;

        const requestData = {
            sourceLocation: document.getElementById('sourceLocation').value,
            destinationId: document.getElementById('destination').value,
            travelMedium: document.getElementById('travelMedium').value,
            budgetMin: parseFloat(document.getElementById('budgetMin').value),
            budgetMax: parseFloat(document.getElementById('budgetMax').value),
            foodPreference: document.getElementById('foodPreference').value,
            specialRequirements: document.getElementById('specialReqs').value,
            shareLocationTelegram: document.getElementById('shareTelegram').checked,
            locationShareIntervalHours: parseInt(document.getElementById('shareInterval').value)
        };
        shareTelegramEnabled = requestData.shareLocationTelegram;

        try {
            if(!requestData.destinationId) throw new Error("Please select a valid destination.");
            
            // 1. Create Travel Plan Draft
            const plan = await api.createTravelPlan(requestData);
            currentPlanId = plan.id;
            
            // 2. Fetch Booking Options
            const options = await api.getBookingOptions(requestData.destinationId, requestData.budgetMax);
            
            // Render Trains
            document.getElementById('train-options').innerHTML = options.trains.map((t, i) => `
                <label style="display: flex; gap: 1rem; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; align-items: flex-start;">
                    <input type="radio" name="trainSelection" value="${t.name}" ${i===0?'checked':''} style="margin-top: 4px;">
                    <div>
                        <strong style="font-size: 1.1rem;">${t.name}</strong><br>
                        <span style="color: #6b7280; font-size: 0.9rem;">${t.departure} - ${t.arrival} (${t.duration})</span><br>
                        <span style="color: var(--primary); font-weight: bold;">₹${t.price}</span>
                    </div>
                </label>
            `).join('');

            // Render Hotels
            document.getElementById('hotel-options').innerHTML = options.hotels.map((h, i) => `
                <label style="display: flex; gap: 1rem; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; align-items: flex-start;">
                    <input type="radio" name="hotelSelection" value="${h.name}" ${i===0?'checked':''} style="margin-top: 4px;">
                    <div>
                        <strong style="font-size: 1.1rem;">${h.name} <span style="font-size: 0.8rem; background: #fef08a; padding: 2px 6px; border-radius: 4px;">⭐ ${h.rating}</span></strong><br>
                        <span style="color: #6b7280; font-size: 0.9rem;">${h.distance}</span><br>
                        <span style="color: var(--primary); font-weight: bold;">₹${h.price} / night</span>
                    </div>
                </label>
            `).join('');

            // Transition UI
            document.getElementById('step-1').style.display = 'none';
            document.getElementById('step-2').style.display = 'block';
            window.scrollTo(0, 0);
            
        } catch (error) {
            alert('Error fetching options: ' + error.message);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
            lucide.createIcons();
        }
    });

    // STEP 2: Confirm Booking & Generate
    document.getElementById('btn-confirm-booking').addEventListener('click', async (e) => {
        const btn = e.target.closest('button');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i data-lucide="loader-2" class="lucide-spin"></i> Confirming & Generating...';
        lucide.createIcons();
        btn.disabled = true;

        const selectedTrain = document.querySelector('input[name="trainSelection"]:checked')?.value;
        const selectedHotel = document.querySelector('input[name="hotelSelection"]:checked')?.value;

        try {
            // 1. Confirm Booking
            const updatedPlan = await api.confirmBooking(currentPlanId, selectedTrain, selectedHotel);
            generatedPnr = updatedPlan.pnrNumber;

            // 2. Transition UI
            document.getElementById('step-2').style.display = 'none';
            document.getElementById('step-3').style.display = 'block';
            
            document.getElementById('display-pnr').innerText = generatedPnr || 'PENDING';
            document.getElementById('display-train').innerText = selectedTrain;
            document.getElementById('display-hotel').innerText = selectedHotel;

            if (selectedTrain) {
                document.getElementById('btn-order-food').style.display = 'flex';
            }

            // 3. Generate Itinerary in background
            api.generateItinerary(currentPlanId).then(() => {
                document.getElementById('itinerary-content').innerHTML = `
                    <div style="padding: 1rem;">
                        <p style="color: #166534;">✅ Itinerary successfully generated and saved to your dashboard!</p>
                        <p>Click <b>Start Journey</b> when you are ready to begin tracking.</p>
                    </div>
                `;
            }).catch(err => {
                document.getElementById('itinerary-content').innerHTML = `<p style="color: red;">Error generating itinerary: ${err.message}</p>`;
            });

        } catch (error) {
            alert('Error confirming booking: ' + error.message);
            btn.innerHTML = originalText;
            btn.disabled = false;
            lucide.createIcons();
        }
    });

    // STEP 3: Start Journey
    document.getElementById('btn-start-journey').addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        btn.innerHTML = '<i data-lucide="check-circle"></i> Journey Active';
        btn.style.backgroundColor = '#16a34a';
        btn.disabled = true;
        lucide.createIcons();

        if (shareTelegramEnabled && currentPlanId) {
            alert('Safety Tracking Activated! Location will be shared every 10 seconds (Mock Demo Mode).');
            setInterval(() => {
                navigator.geolocation.getCurrentPosition((pos) => {
                    api.updateLocation(currentPlanId, pos.coords.latitude, pos.coords.longitude)
                       .catch(err => console.error("Tracking error:", err));
                });
            }, 10000);
        } else if (!shareTelegramEnabled) {
            alert('Journey started. (Safety tracking was not enabled during plan creation).');
        }
    });

    // FOOD MODAL LOGIC
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
            // For hackathon demo, user said they will provide valid PNRs. 
            // We use the generatedPnr unless it's mock (like 1234567890). For safety, let's prompt user for a real PNR for the demo if they want.
            const pnrToUse = prompt("Enter a valid PNR to view real staging data (or leave blank to use mock PNR)", "8937018601") || generatedPnr;
            
            const response = await api.getTrainFoodOptions(pnrToUse);
            trainFoodData = response.result;

            if (!trainFoodData || !trainFoodData.stations) {
                throw new Error("No stations found for this PNR.");
            }

            // Render Stations with outlets
            const stationsHtml = trainFoodData.stations
                .filter(s => s.outletCount > 0)
                .map(s => `
                    <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong style="font-size: 1.1rem;">${s.name} (${s.code})</strong>
                            <p style="margin: 0; color: #6b7280; font-size: 0.9rem;">Arrival: ${s.arrival} | Halt: ${s.halt} mins | Outlets: ${s.outletCount}</p>
                        </div>
                        <button class="btn-primary select-station-btn" data-station="${s.code}" data-pnr="${pnrToUse}" style="background-color: #ea580c;">View Menu</button>
                    </div>
                `).join('');

            modalBody.innerHTML = `
                <h3>Select a station for delivery</h3>
                ${stationsHtml}
            `;

            // Add event listeners to "View Menu" buttons
            document.querySelectorAll('.select-station-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const stationCode = e.target.getAttribute('data-station');
                    const pnr = e.target.getAttribute('data-pnr');
                    showTrendingItems(stationCode, pnr);
                });
            });

        } catch (error) {
            modalBody.innerHTML = `<div style="color: red; padding: 2rem; text-align: center;">Error: ${error.message}</div>`;
        }
    });

    const showTrendingItems = (stationCode, pnr) => {
        const modalBody = document.getElementById('food-modal-body');
        
        // Filter trending items available at this station
        const items = trainFoodData.trendingItems.filter(item => item.availableAtStations.includes(stationCode));
        const station = trainFoodData.stations.find(s => s.code === stationCode);

        let itemsHtml = items.map(item => `
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: space-between;">
                <img src="${item.imageURL}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 50%; margin-bottom: 0.5rem;">
                <strong style="font-size: 1rem;">${item.name}</strong>
                <button class="btn-primary place-mock-order-btn" style="margin-top: 1rem; width: 100%;" 
                    data-pnr="${pnr}" 
                    data-station-code="${station.code}" 
                    data-station-name="${station.name}">Order Now</button>
            </div>
        `).join('');

        if(items.length === 0) {
            itemsHtml = "<p>No trending items available here.</p>";
        }

        modalBody.innerHTML = `
            <button class="btn-secondary" id="back-to-stations" style="margin-bottom: 1rem;"><i data-lucide="arrow-left"></i> Back to Stations</button>
            <h3>Trending at ${station.name}</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem;">
                ${itemsHtml}
            </div>
        `;
        lucide.createIcons();

        document.getElementById('back-to-stations').addEventListener('click', () => {
            document.getElementById('btn-order-food').click(); // Re-trigger station fetch
        });

        // Place Order
        document.querySelectorAll('.place-mock-order-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const button = e.target;
                button.innerHTML = '<i data-lucide="loader-2" class="lucide-spin"></i> Ordering...';
                lucide.createIcons();
                button.disabled = true;

                const stationObj = trainFoodData.stations.find(s => s.code === button.getAttribute('data-station-code'));
                const orderPayload = {
                    "deliveryDetails": {
                        "berth": "33",
                        "coach": "B3",
                        "pnr": button.getAttribute('data-pnr'),
                        "isSeatEdited": false,
                        "station": {
                            "code": stationObj.code,
                            "name": stationObj.name
                        },
                        "train": {
                            "name": trainFoodData.trainInfo.trainName,
                            "number": trainFoodData.trainInfo.trainNo
                        },
                        "delivery": {
                            "date": stationObj.arrivalDate + " " + stationObj.arrival + " IST" 
                        }
                    },
                    "outlet": {
                        "id": 62776362,
                        "vendor": {
                            "id": 6325397
                        }
                    },
                    "customer": {
                        "id": 62754654
                    },
                    "orderFrom": "desktop web",
                    "orderItems": [
                        {
                            "itemId": "6661349138",
                            "id": "6661349138",
                            "quantity": 3
                        }
                    ],
                    "alternateMobileNumber": null,
                    "gstin": null,
                    "comment": null,
                    "cartId": null,
                    "isReverseOrder": false,
                    "couponDetails": {
                        "couponCode": null,
                        "couponAutoApply": false
                    },
                    "paymentDetails": {
                        "paymentType": "PRE_PAID"
                    },
                    "appliedSortMethod": "RATINGS"
                };

                try {
                    const orderRes = await api.placeFoodOrder(orderPayload);
                    
                    if (orderRes.status === "failure") {
                        throw new Error(orderRes.message || "Failed to place order");
                    }
                    
                    modalBody.innerHTML = `
                        <div style="text-align: center; padding: 2rem;">
                            <div style="color: #16a34a; font-size: 4rem; margin-bottom: 1rem;"><i data-lucide="check-circle" style="width: 64px; height: 64px;"></i></div>
                            <h2 style="color: #16a34a;">Order Placed Successfully!</h2>
                            <p style="font-size: 1.2rem;">eCatering Order ID: <strong>${orderRes.result.id}</strong></p>
                            <p>Status: <strong>${orderRes.result.status}</strong></p>
                            <p>Your food will be delivered at ${button.getAttribute('data-station-name')}.</p>
                            <button class="btn-primary" onclick="document.getElementById('close-food-modal').click()" style="margin-top: 2rem;">Close</button>
                        </div>
                    `;
                    lucide.createIcons();
                } catch(err) {
                    alert("Order failed: " + err.message);
                    button.innerHTML = 'Order Now';
                    button.disabled = false;
                }
            });
        });
    };
};
