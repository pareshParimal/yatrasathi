import { api } from '../api.js';

export const renderHome = async (rootElement) => {
    // Basic Layout Structure
    rootElement.innerHTML = `
        <div class="dashboard-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
                <h1 style="margin-bottom: 0.5rem;" data-i18n="home_welcome">Welcome to YatraSathi</h1>
                <p style="margin: 0;" data-i18n="home_subtitle">Your trusted companion for safe and comfortable travel across India.</p>
            </div>
            <button id="btn-toggle-itineraries" class="btn-secondary" style="display: flex; align-items: center; gap: 8px;">
                <i data-lucide="calendar"></i> <span data-i18n="home_view_itineraries">View My Itineraries</span>
            </button>
        </div>

        <!-- HIDDEN ITINERARIES DRAWER -->
        <div id="itineraries-container" style="display: none; background: #f9fafb; padding: 1.5rem; border-radius: 8px; border: 1px solid #e5e7eb; margin-top: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3 style="margin: 0;"><i data-lucide="calendar" style="width: 20px; height: 20px; vertical-align: bottom;"></i> <span data-i18n="home_your_trips">Your Trips</span></h3>
                <button id="btn-close-itineraries" style="background: none; border: none; cursor: pointer; font-size: 1.2rem; color: #6b7280;">&times;</button>
            </div>
            <div id="itineraries-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem;">
                <div style="grid-column: 1 / -1; padding: 1rem; text-align: center; color: #6b7280;">
                    <i data-lucide="loader-2" class="lucide-spin" style="width: 20px; height: 20px;"></i> Loading...
                </div>
            </div>
        </div>

        <h2 style="margin-top: 3rem;" data-i18n="home_quick_actions">Quick Actions</h2>
        <div class="dashboard-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-top: 1rem;">
            
            <div class="card feature-card" onclick="window.location.hash='planner'" style="cursor: pointer;">
                <i data-lucide="map" style="width: 48px; height: 48px; color: var(--primary); margin-bottom: 1rem;"></i>
                <h2 data-i18n="home_plan_trip">Plan a New Trip</h2>
                <p class="text-muted" data-i18n="home_plan_trip_desc">Set your preferences and let us generate a comfortable, elderly-friendly itinerary for you.</p>
            </div>

            <div class="card feature-card" onclick="window.location.hash='places'" style="cursor: pointer;">
                <i data-lucide="image" style="width: 48px; height: 48px; color: var(--secondary); margin-bottom: 1rem;"></i>
                <h2 data-i18n="home_discover">Discover Places</h2>
                <p class="text-muted" data-i18n="home_discover_desc">Explore rich history and culture with storytelling content designed just for you.</p>
            </div>

            <div class="card feature-card" onclick="window.location.hash='chat'" style="cursor: pointer;">
                <i data-lucide="bot" style="width: 48px; height: 48px; color: var(--accent); margin-bottom: 1rem;"></i>
                <h2 data-i18n="home_talk_assistant">Talk to Assistant</h2>
                <p class="text-muted" data-i18n="home_talk_assistant_desc">Have a question? Our intelligent AI is here to answer any queries about your travel.</p>
            </div>
            
            <div class="card feature-card">
                <i data-lucide="coffee" style="width: 48px; height: 48px; color: var(--primary-dark); margin-bottom: 1rem;"></i>
                <h2 data-i18n="home_train_food">Train Food</h2>
                <p class="text-muted" data-i18n="home_train_food_desc">Find reliable platforms to order hot, hygienic food directly to your train seat.</p>
                <button class="btn-primary" style="margin-top: 1rem; width: 100%; padding: 0.5rem;" onclick="alert('Food directory coming soon!')" data-i18n="home_view_options">View Options</button>
            </div>

            <div class="card feature-card" id="btn-open-contacts" style="cursor: pointer;">
                <i data-lucide="shield" style="width: 48px; height: 48px; color: #dc2626; margin-bottom: 1rem;"></i>
                <h2 data-i18n="home_emergency_contacts">Emergency Contacts</h2>
                <p class="text-muted" data-i18n="home_emergency_contacts_desc">Add family members who will receive your live location updates via Telegram during trips.</p>
            </div>

        </div>

        <!-- DETAILS MODAL -->
        <div id="details-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;">
            <div class="card" style="width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto; background: white; padding: 2rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 1rem; margin-bottom: 1rem;">
                    <h2 style="margin: 0; display: flex; align-items: center; gap: 8px;"><i data-lucide="info"></i> Itinerary Details</h2>
                    <button id="btn-close-details" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
                </div>
                <div id="details-modal-body"></div>
            </div>
        </div>

        <!-- FOOD MODAL -->
        <div id="food-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 1001; align-items: center; justify-content: center;">
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

        <!-- EMERGENCY CONTACTS MODAL -->
        <div id="contacts-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1002; align-items: center; justify-content: center;">
            <div class="card" style="width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; background: white; padding: 2rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 1rem; margin-bottom: 1rem;">
                    <h2 style="margin: 0; display: flex; align-items: center; gap: 8px; color: #dc2626;"><i data-lucide="shield"></i> Emergency Contacts</h2>
                    <button id="btn-close-contacts" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
                </div>
                <div id="contacts-modal-body">
                    <div style="text-align: center; padding: 2rem;"><i data-lucide="loader-2" class="lucide-spin"></i> Loading...</div>
                </div>
            </div>
        </div>
    `;
    lucide.createIcons();

    const container = document.getElementById('itineraries-container');
    const listContainer = document.getElementById('itineraries-list');
    let hasLoaded = false;
    let allPlans = [];
    let trainFoodData = null;

    // Toggle Itineraries List
    document.getElementById('btn-toggle-itineraries').addEventListener('click', async () => {
        container.style.display = 'block';
        
        if (hasLoaded) return; // Don't re-fetch if already loaded this session
        
        try {
            allPlans = await api.getTravelPlans();
            
            if (!allPlans || allPlans.length === 0) {
                listContainer.innerHTML = `
                    <div style="grid-column: 1 / -1; padding: 1.5rem; text-align: center; color: #6b7280; border: 1px dashed #d1d5db; border-radius: 6px; font-size: 0.9rem;">
                        <p style="margin: 0 0 0.5rem 0;">You have no trips planned yet.</p>
                        <a href="#planner" style="color: var(--primary); font-weight: bold;">Start Planning -></a>
                    </div>
                `;
                hasLoaded = true;
                return;
            }

            listContainer.innerHTML = allPlans.map(plan => {
                const isConfirmed = plan.bookingStatus === 'CONFIRMED';
                const statusColor = isConfirmed ? '#16a34a' : '#ea580c';
                const statusBg = isConfirmed ? '#dcfce7' : '#ffedd5';
                const statusText = isConfirmed ? 'ACTIVE' : 'DRAFT';

                return `
                    <div style="background: white; border: 1px solid #e5e7eb; border-left: 4px solid ${statusColor}; border-radius: 6px; padding: 1rem; position: relative; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                        <span style="position: absolute; top: 0.8rem; right: 0.8rem; background: ${statusBg}; color: ${statusColor}; padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.7rem; font-weight: bold;">
                            ${statusText}
                        </span>
                        <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; padding-right: 3.5rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${plan.destination?.name || 'Unknown'}</h4>
                        <div style="font-size: 0.85rem; color: #4b5563; line-height: 1.4;">
                            <div style="display: flex; align-items: flex-start; gap: 6px; margin-bottom: 4px;">
                                <i data-lucide="train" style="width: 14px; height: 14px; flex-shrink: 0; margin-top: 2px;"></i>
                                <span>${plan.bookedTrainName || 'No Train'} ${plan.pnrNumber ? `<br><strong style="font-size: 0.8rem;">PNR: ${plan.pnrNumber}</strong>` : ''}</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <i data-lucide="hotel" style="width: 14px; height: 14px; flex-shrink: 0;"></i>
                                <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${plan.bookedHotelName || 'No Hotel'}</span>
                            </div>
                        </div>
                        <button class="btn-secondary btn-view-details" data-id="${plan.id}" style="width: 100%; margin-top: 1rem; padding: 0.4rem; font-size: 0.8rem;">View Details</button>
                    </div>
                `;
            }).join('');
            
            // Attach view details listeners
            document.querySelectorAll('.btn-view-details').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const planId = e.target.getAttribute('data-id');
                    openDetailsModal(planId);
                });
            });

            lucide.createIcons();
            hasLoaded = true;

        } catch (error) {
            listContainer.innerHTML = `
                <div style="grid-column: 1 / -1; padding: 1rem; text-align: center; color: #ef4444; border: 1px dashed #fca5a5; border-radius: 6px; font-size: 0.9rem;">
                    Failed to load itineraries.
                </div>
            `;
        }
    });

    document.getElementById('btn-close-itineraries').addEventListener('click', () => {
        container.style.display = 'none';
    });

    document.getElementById('btn-close-details').addEventListener('click', () => {
        document.getElementById('details-modal').style.display = 'none';
    });

    // Details Modal Logic
    const openDetailsModal = (planId) => {
        const plan = allPlans.find(p => p.id === planId);
        if (!plan) return;

        const isConfirmed = plan.bookingStatus === 'CONFIRMED';
        
        let foodSection = '';
        if (isConfirmed && plan.pnrNumber) {
            if (plan.ecateringOrderId) {
                foodSection = `
                    <div style="background: #ffedd5; border: 1px solid #fdba74; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                        <h4 style="margin: 0 0 0.5rem 0; color: #ea580c; display: flex; align-items: center; gap: 8px;"><i data-lucide="check-circle"></i> Food Order Confirmed</h4>
                        <p style="margin: 0; color: #9a3412;">eCatering Order ID: <strong>${plan.ecateringOrderId}</strong></p>
                    </div>
                `;
            } else {
                foodSection = `
                    <div style="background: #f3f4f6; border: 1px solid #e5e7eb; padding: 1rem; border-radius: 8px; margin-top: 1rem; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="margin: 0 0 0.2rem 0;">Hungry on the train?</h4>
                            <p style="margin: 0; font-size: 0.9rem; color: #4b5563;">Order food directly to your seat using your PNR.</p>
                        </div>
                        <button class="btn-primary" id="btn-launch-food-modal" data-pnr="${plan.pnrNumber}" data-plan-id="${plan.id}" style="background-color: #ea580c;">Order Food</button>
                    </div>
                `;
            }
        }

        let itinerarySection = '<p style="color: #6b7280; font-style: italic;">No detailed itinerary generated yet.</p>';
        if (plan.itineraryItems && plan.itineraryItems.length > 0) {
            // Group by day
            const days = {};
            plan.itineraryItems.forEach(item => {
                if (!days[item.dayNumber]) days[item.dayNumber] = [];
                days[item.dayNumber].push(item);
            });

            itinerarySection = Object.keys(days).sort().map(day => `
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="margin-bottom: 0.5rem; color: var(--primary); border-bottom: 2px solid #eef2ff; padding-bottom: 4px;">Day ${day}</h4>
                    <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                        ${days[day].map(item => `
                            <div style="display: flex; gap: 1rem;">
                                <div style="min-width: 80px; font-weight: bold; color: #4b5563; font-size: 0.9rem;">${item.timeSlot || 'Anytime'}</div>
                                <div>
                                    <strong style="display: block; color: #111827;">${item.activity}</strong>
                                    ${item.locationName ? `<span style="font-size: 0.85rem; color: #6b7280;"><i data-lucide="map-pin" style="width:12px;height:12px;"></i> ${item.locationName}</span>` : ''}
                                    ${item.notes ? `<p style="font-size: 0.85rem; color: #6b7280; margin: 0.2rem 0 0 0;">${item.notes}</p>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
        }

        document.getElementById('details-modal-body').innerHTML = `
            <div style="margin-bottom: 2rem;">
                <h3 style="margin-top: 0;">${plan.title || 'Trip to ' + plan.destination?.name}</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; background: #f9fafb; padding: 1rem; border-radius: 8px;">
                    <div>
                        <span style="color: #6b7280; font-size: 0.8rem; text-transform: uppercase;">Train</span>
                        <div style="font-weight: bold;">${plan.bookedTrainName || 'N/A'}</div>
                        ${plan.pnrNumber ? `<div style="font-size: 0.9rem;">PNR: ${plan.pnrNumber}</div>` : ''}
                    </div>
                    <div>
                        <span style="color: #6b7280; font-size: 0.8rem; text-transform: uppercase;">Hotel</span>
                        <div style="font-weight: bold;">${plan.bookedHotelName || 'N/A'}</div>
                    </div>
                </div>
                ${foodSection}
            </div>
            
            <h3>Day-by-Day Plan</h3>
            <div style="background: white; border: 1px solid #e5e7eb; padding: 1.5rem; border-radius: 8px;">
                ${itinerarySection}
            </div>
        `;
        
        lucide.createIcons();
        document.getElementById('details-modal').style.display = 'flex';

        // Attach food modal trigger if it exists
        const btnFood = document.getElementById('btn-launch-food-modal');
        if (btnFood) {
            btnFood.addEventListener('click', (e) => {
                const pnr = e.target.getAttribute('data-pnr');
                const pId = e.target.getAttribute('data-plan-id');
                openFoodModal(pnr, pId);
            });
        }
    };

    // Food Modal Logic (Copied from planner.js)
    document.getElementById('close-food-modal').addEventListener('click', () => {
        document.getElementById('food-modal').style.display = 'none';
    });

    const openFoodModal = async (pnr, planId) => {
        const modal = document.getElementById('food-modal');
        const modalBody = document.getElementById('food-modal-body');
        modal.style.display = 'flex';
        modalBody.innerHTML = '<div style="text-align: center; padding: 2rem;"><i data-lucide="loader-2" class="lucide-spin"></i> Fetching eCatering stations...</div>';
        lucide.createIcons();

        try {
            const pnrToUse = prompt("Enter a valid PNR to view real staging data (or leave blank to use mock PNR)", "2159351649") || pnr;
            const response = await api.getTrainFoodOptions(pnrToUse);
            trainFoodData = response.result;

            if (!trainFoodData || !trainFoodData.stations) {
                throw new Error("No stations found for this PNR.");
            }

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

            modalBody.innerHTML = `<h3>Select a station for delivery</h3>${stationsHtml}`;

            document.querySelectorAll('.select-station-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const stationCode = e.target.getAttribute('data-station');
                    const pnr = e.target.getAttribute('data-pnr');
                    showTrendingItems(stationCode, pnr, planId);
                });
            });

        } catch (error) {
            modalBody.innerHTML = `<div style="color: red; padding: 2rem; text-align: center;">Error: ${error.message}</div>`;
        }
    };

    const showTrendingItems = (stationCode, pnr, planId) => {
        const modalBody = document.getElementById('food-modal-body');
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

        if(items.length === 0) itemsHtml = "<p>No trending items available here.</p>";

        modalBody.innerHTML = `
            <button class="btn-secondary" id="back-to-stations" style="margin-bottom: 1rem;"><i data-lucide="arrow-left"></i> Back to Stations</button>
            <h3>Trending at ${station.name}</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem;">
                ${itemsHtml}
            </div>
        `;
        lucide.createIcons();

        document.getElementById('back-to-stations').addEventListener('click', () => {
            openFoodModal(pnr, planId); 
        });

        document.querySelectorAll('.place-mock-order-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const button = e.target;
                button.innerHTML = '<i data-lucide="loader-2" class="lucide-spin"></i> Ordering...';
                lucide.createIcons();
                button.disabled = true;

                const stationObj = trainFoodData.stations.find(s => s.code === button.getAttribute('data-station-code'));
                const orderPayload = {
                    "deliveryDetails": {
                        "berth": "29",
                        "coach": "A4",
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
                        "vendor": { "id": 6325397 }
                    },
                    "customer": { "id": 62754654 },
                    "orderFrom": "desktop web",
                    "orderItems": [{ "itemId": "6661349138", "id": "6661349138", "quantity": 3 }],
                    "alternateMobileNumber": null,
                    "gstin": null,
                    "comment": null,
                    "cartId": null,
                    "isReverseOrder": false,
                    "couponDetails": { "couponCode": null, "couponAutoApply": false },
                    "paymentDetails": { "paymentType": "PRE_PAID" },
                    "appliedSortMethod": "RATINGS"
                };

                try {
                    const orderRes = await api.placeFoodOrder(orderPayload, planId);
                    
                    if (orderRes.status === "failure") {
                        throw new Error(orderRes.message || "Failed to place order");
                    }
                    
                    modalBody.innerHTML = `
                        <div style="text-align: center; padding: 2rem;">
                            <div style="color: #16a34a; font-size: 4rem; margin-bottom: 1rem;"><i data-lucide="check-circle" style="width: 64px; height: 64px;"></i></div>
                            <h2 style="color: #16a34a;">Order Placed Successfully!</h2>
                            <p style="font-size: 1.2rem;">eCatering Order ID: <strong>${orderRes.result.id}</strong></p>
                            <button class="btn-primary" onclick="document.getElementById('close-food-modal').click()" style="margin-top: 2rem;">Close</button>
                        </div>
                    `;
                    
                    // Mark as needing refresh
                    hasLoaded = false;
                    
                    lucide.createIcons();
                } catch(err) {
                    alert("Order failed: " + err.message);
                    button.innerHTML = 'Order Now';
                    button.disabled = false;
                }
            });
        });
    };

    // ========== EMERGENCY CONTACTS MODAL ==========

    const contactsModal = document.getElementById('contacts-modal');
    const contactsBody = document.getElementById('contacts-modal-body');

    document.getElementById('btn-open-contacts').addEventListener('click', () => {
        contactsModal.style.display = 'flex';
        loadContactsModal();
    });

    document.getElementById('btn-close-contacts').addEventListener('click', () => {
        contactsModal.style.display = 'none';
    });

    const loadContactsModal = async () => {
        contactsBody.innerHTML = '<div style="text-align: center; padding: 2rem;"><i data-lucide="loader-2" class="lucide-spin"></i> Loading...</div>';
        lucide.createIcons();

        try {
            const [contacts, telegramUsers] = await Promise.all([
                api.getEmergencyContacts(),
                api.getTelegramUsers()
            ]);

            // Build the contact list
            let contactListHtml = '';
            if (contacts && contacts.length > 0) {
                contactListHtml = contacts.map(c => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.8rem 1rem; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;">
                        <div>
                            <strong style="font-size: 1rem;">${c.contactName}</strong>
                            <div style="font-size: 0.85rem; color: #6b7280;">Chat ID: ${c.telegramChatId}</div>
                        </div>
                        <button class="btn-delete-contact" data-id="${c.id}" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 0.3rem;" title="Remove contact">
                            <i data-lucide="trash-2" style="width: 18px; height: 18px;"></i>
                        </button>
                    </div>
                `).join('');
            } else {
                contactListHtml = `
                    <div style="padding: 1rem; text-align: center; color: #6b7280; border: 1px dashed #d1d5db; border-radius: 6px; font-size: 0.9rem;">
                        No emergency contacts added yet.
                    </div>
                `;
            }

            // Build the Telegram user dropdown options
            let telegramOptions = '<option value="">-- Select a Telegram user --</option>';
            if (telegramUsers && telegramUsers.length > 0) {
                telegramOptions += telegramUsers.map(u => `<option value="${u.chatId}">${u.name} (ID: ${u.chatId})</option>`).join('');
            } else {
                telegramOptions = '<option value="">No users found — ask contacts to message your bot first</option>';
            }

            contactsBody.innerHTML = `
                <div style="margin-bottom: 1.5rem;">
                    <h3 style="margin: 0 0 0.5rem 0; font-size: 1rem;">Your Contacts</h3>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        ${contactListHtml}
                    </div>
                </div>

                <div style="background: #eef2ff; padding: 1.2rem; border-radius: 8px;">
                    <h3 style="margin: 0 0 0.8rem 0; font-size: 1rem; color: var(--primary);">Add New Contact</h3>

                    <p style="font-size: 0.85rem; color: #4b5563; margin: 0 0 1rem 0;">
                        Ask your family member to open <strong>@YatraSathiBot</strong> on Telegram and click <strong>Start</strong>. They will then appear in the dropdown below.
                    </p>

                    <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                        <div>
                            <label style="font-weight: 600; font-size: 0.9rem; display: block; margin-bottom: 4px;">Contact Name</label>
                            <input type="text" id="new-contact-name" class="form-control" placeholder="e.g., Son - Rahul" style="width: 100%;">
                        </div>
                        <div>
                            <label style="font-weight: 600; font-size: 0.9rem; display: block; margin-bottom: 4px;">Select from Telegram</label>
                            <select id="new-contact-telegram" class="form-control" style="width: 100%;">
                                ${telegramOptions}
                            </select>
                        </div>
                        <button class="btn-primary" id="btn-add-contact" style="padding: 0.6rem;">
                            <i data-lucide="user-plus" style="width: 16px; height: 16px;"></i> Add Contact
                        </button>
                    </div>
                </div>
            `;

            lucide.createIcons();

            // Wire up "Add Contact" button
            document.getElementById('btn-add-contact').addEventListener('click', async () => {
                const name = document.getElementById('new-contact-name').value.trim();
                const chatId = document.getElementById('new-contact-telegram').value;

                if (!name) { alert('Please enter a contact name.'); return; }
                if (!chatId) { alert('Please select a Telegram user.'); return; }

                const btn = document.getElementById('btn-add-contact');
                btn.disabled = true;
                btn.innerHTML = '<i data-lucide="loader-2" class="lucide-spin" style="width: 16px; height: 16px;"></i> Adding...';
                lucide.createIcons();

                try {
                    await api.addEmergencyContact({ contactName: name, telegramChatId: chatId });
                    loadContactsModal(); // Reload the modal
                } catch (err) {
                    alert('Failed to add contact: ' + err.message);
                    btn.disabled = false;
                    btn.innerHTML = '<i data-lucide="user-plus" style="width: 16px; height: 16px;"></i> Add Contact';
                    lucide.createIcons();
                }
            });

            // Wire up delete buttons
            document.querySelectorAll('.btn-delete-contact').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const contactId = e.currentTarget.getAttribute('data-id');
                    if (!confirm('Remove this emergency contact?')) return;

                    try {
                        await api.deleteEmergencyContact(contactId);
                        loadContactsModal(); // Reload
                    } catch (err) {
                        alert('Failed to remove contact: ' + err.message);
                    }
                });
            });

        } catch (error) {
            contactsBody.innerHTML = `<div style="color: red; padding: 1rem; text-align: center;">Failed to load contacts: ${error.message}</div>`;
        }
    };
};
