const API_BASE_URL = 'https://yatrasathi-production.up.railway.app/api/v1';

// We will read the user ID from localStorage
const getUserId = () => localStorage.getItem('yatra_user_id') || '';

async function fetchAPI(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'X-User-Id': getUserId(),
        ...options.headers
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data.data; // Assuming ApiResponse<T> wraps data in a 'data' field
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

export const api = {
    // Places
    getPlaces: () => fetchAPI('/places'),
    getPlaceContent: (id) => fetchAPI(`/places/${id}/content`),

    // Travel Plans
    createTravelPlan: (data) => fetchAPI('/travel-plans', { method: 'POST', body: JSON.stringify(data) }),
    getTravelPlans: () => fetchAPI('/travel-plans'),
    generateItinerary: (id) => fetchAPI(`/travel-plans/${id}/itinerary/generate`, { method: 'POST' }),
    // Bookings
    getBookingOptions: (destinationId, budgetMax) => fetchAPI(`/bookings/options?destinationId=${destinationId}${budgetMax ? '&budgetMax=' + budgetMax : ''}`),
    searchTrains: ({ fromCity, toCity, travelDate, departureFrom, departureTo, maxDurationHours }) => {
        const params = new URLSearchParams();
        if (fromCity) params.set('fromCity', fromCity);
        if (toCity) params.set('toCity', toCity);
        if (travelDate) params.set('travelDate', travelDate);
        if (departureFrom) params.set('departureFrom', departureFrom);
        if (departureTo) params.set('departureTo', departureTo);
        if (maxDurationHours) params.set('maxDurationHours', maxDurationHours);
        return fetchAPI(`/bookings/trains?${params.toString()}`);
    },
    searchHotels: ({ destinationId, landmarkLat, landmarkLng, landmarkName, maxPricePerNight, radiusKm }) => {
        const params = new URLSearchParams();
        if (destinationId) params.set('destinationId', destinationId);
        if (landmarkLat) params.set('landmarkLat', landmarkLat);
        if (landmarkLng) params.set('landmarkLng', landmarkLng);
        if (landmarkName) params.set('landmarkName', landmarkName);
        if (maxPricePerNight) params.set('maxPricePerNight', maxPricePerNight);
        if (radiusKm) params.set('radiusKm', radiusKm);
        return fetchAPI(`/bookings/hotels?${params.toString()}`);
    },
    confirmBooking: (planId, trainName, hotelName) => fetchAPI(`/bookings/confirm/${planId}`, { method: 'POST', body: JSON.stringify({ trainName, hotelName }) }),

    // Chat
    sendMessage: (data, sessionId) => fetchAPI(`/chat/sessions${sessionId ? '?sessionId=' + sessionId : ''}`, { method: 'POST', body: JSON.stringify(data) }),

    // Train Food
    getTrainFoodOptions: (pnr) => fetchAPI(`/food/pnr/${pnr}`),
    placeFoodOrder: (payload, planId) => fetchAPI(`/food/order${planId ? '?planId=' + planId : ''}`, { method: 'POST', body: JSON.stringify(payload) }),

    // Weather
    getWeather: (placeId) => fetchAPI(`/places/${placeId}/weather`),

    // Location
    updateLocation: (planId, lat, lng) => fetchAPI(`/travel-plans/${planId}/location`, {
        method: 'POST',
        body: JSON.stringify({ latitude: lat, longitude: lng })
    }),

    // Auth
    requestOtp: (data) => fetchAPI('/auth/request-otp', { method: 'POST', body: JSON.stringify(data) }),
    verifyOtp: (data) => fetchAPI('/auth/verify-otp', { method: 'POST', body: JSON.stringify(data) }),

    // Emergency Contacts
    getEmergencyContacts: () => fetchAPI('/location/contacts'),
    addEmergencyContact: (data) => fetchAPI('/location/contacts', { method: 'POST', body: JSON.stringify(data) }),
    deleteEmergencyContact: (contactId) => fetchAPI(`/location/contacts/${contactId}`, { method: 'DELETE' }),
    getTelegramUsers: () => fetchAPI('/location/telegram-users'),
};
