import axios from "axios";

// 🌐 BASE API
const API = axios.create({
    baseURL: "http://localhost:8000/api",
});

// 🔐 ATTACH TOKEN AUTOMATICALLY
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("access");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// ❌ GLOBAL ERROR HANDLER
API.interceptors.response.use(
    (res) => res,
    (err) => {
        console.error("❌ API ERROR:", err.response?.data || err.message);
        return Promise.reject(err);
    }
);

// ================================
// 🧠 NORMALIZE RIDE DATA
// ================================
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
    seats_remaining: ride.seats_remaining ?? ride.available_seats ?? 0,

    driver: ride.driver,
    route_geometry: ride.route_geometry,

    status: ride.status,
    date_time: ride.date_time,
});

// ================================
// 🔍 SEARCH RIDES (MAIN)
// ================================
export const getRides = async (data) => {
    try {
        const res = await API.post("/rides/search/", data);

        // ✅ Normalize all rides
        return {
            data: res.data.map(normalizeRide),
        };

    } catch (error) {
        throw error;
    }
};

// ================================
// 📍 CALCULATE ROUTE
// ================================
export const calculateRoute = async (source, destination) => {
    try {
        const res = await API.post("/rides/calculate-route/", {
            source,
            destination,
        });

        return res.data;

    } catch (error) {
        throw error;
    }
};

// ================================
// 🚗 CREATE RIDE (DRIVER)
// ================================
export const createRide = async (data) => {
    try {
        const res = await API.post("/rides/", data);
        return res.data;

    } catch (error) {
        throw error;
    }
};

// ================================
// 👤 MY RIDES (DRIVER)
// ================================
export const getMyRides = async () => {
    try {
        const res = await API.get("/rides/my_rides/");
        return res.data.map(normalizeRide);

    } catch (error) {
        throw error;
    }
};