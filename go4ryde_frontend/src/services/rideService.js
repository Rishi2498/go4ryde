import axios from "axios";

// ========================================
// 🌐 AXIOS INSTANCE
// ========================================
const API = axios.create({
    baseURL: "http://localhost:8000/api",
});

// ========================================
// 🔐 ATTACH JWT TOKEN
// ========================================
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
if (import.meta.env.DEV) {
    // console.log("🚀 REQUEST:", config.url);
    // console.log("🔑 TOKEN:", !!token);
}

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// ========================================
// ❌ GLOBAL ERROR HANDLER
// ========================================
API.interceptors.response.use(
    (response) => response,
    (error) => {

        console.error(
            "❌ API ERROR:",
            error.response?.data || error.message
        );

        if (error.response?.status === 401) {
            console.warn("⚠️ Unauthorized Request");
        }

        return Promise.reject(error);
    }
);

// ========================================
// 🧠 NORMALIZE RIDE DATA
// ========================================
const normalizeRide = (ride) => ({
    id: ride.id,
    source: ride.source,
    destination: ride.destination,

    source_lat: ride.source_lat,
    source_lng: ride.source_lng,

    destination_lat: ride.destination_lat,
    destination_lng: ride.destination_lng,

    price_per_seat: ride.price_per_seat,
    distance_km: ride.distance_km,
    duration_min: ride.duration_min,

    seats_total: ride.seats_total,

    seats_remaining:
        ride.seats_remaining ??
        ride.available_seats ??
        0,

    driver: ride.driver,
    route_geometry: ride.route_geometry,

    status: ride.status,
    date_time: ride.date_time,
});

// ========================================
// 🚗 GET ALL RIDES
// ========================================
export const getRides = async () => {
    try {

        const res = await API.get("/rides/");

        return {
            data: res.data.map(normalizeRide),
        };

    } catch (error) {
        throw error;
    }
};

// ========================================
// 📍 CALCULATE ROUTE
// ========================================
export const calculateRoute = async (
    source,
    destination
) => {
    try {

        const res = await API.post(
            "/rides/calculate-route/",
            {
                source,
                destination,
            }
        );

        return res.data;

    } catch (error) {
        throw error;
    }
};

// ========================================
// 🚗 CREATE RIDE
// ========================================
export const createRide = async (data) => {
    try {

        const res = await API.post(
            "/rides/",
            data
        );

        return res.data;

    } catch (error) {
        throw error;
    }
};

// ========================================
// 👤 MY RIDES
// ========================================
export const getMyRides = async () => {
    try {

        const res = await API.get(
            "/rides/my_rides/"
        );

        return res.data.map(normalizeRide);

    } catch (error) {
        throw error;
    }
};

// ========================================
// 🚗 START RIDE
// ========================================
export const startRide = async (
    bookingId
) => {

    try {

        const res = await API.post(
            `/rides/start/${bookingId}/`
        );

        return res.data;

    } catch (error) {

        throw error;
    }
};


// ========================================
// 🏁 END RIDE
// ========================================
export const endRide = async (
    bookingId
) => {

    try {

        const res = await API.post(
            `/rides/end/${bookingId}/`
        );

        return res.data;

    } catch (error) {

        throw error;
    }
};

// ========================================
// 🔔 GET MY NOTIFICATIONS
// ========================================
export const getNotifications = async () => {

    try {

        const res = await API.get(
            "/notifications/"
        );

        return res.data;

    } catch (error) {

        throw error;
    }
};

export default API;