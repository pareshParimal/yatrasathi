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
    verifyOtp: (data) => fetchAPI('/auth/verify-otp', { method: 'POST', body: JSON.stringify(data) })
};
