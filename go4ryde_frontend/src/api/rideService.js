import api from "../utils/axiosInstance";

// -----------------------------
// 🚀 CREATE RIDE
// -----------------------------
export const createRide = (data) => {
    return api.post("/rides/", data);
};

// -----------------------------
// 🚀 GET ALL RIDES (FILTER)
// -----------------------------
export const getRides = (params = {}) => {
    return api.get("/rides/", { params });
};

// -----------------------------
// 🚀 GET SINGLE RIDE
// -----------------------------
export const getRide = (id) => {
    return api.get(`/rides/${id}/`);
};

// -----------------------------
// 🚀 UPDATE RIDE
// -----------------------------
export const updateRide = (id, data) => {
    return api.put(`/rides/${id}/`, data);
};

// -----------------------------
// 🚀 DELETE RIDE
// -----------------------------
export const deleteRide = (id) => {
    return api.delete(`/rides/${id}/`);
};

// -----------------------------
// 🚀 MY RIDES (DRIVER)
// -----------------------------
export const getMyRides = () => {
    return api.get("/rides/my_rides/");
};

// -----------------------------
// 🚀 ROUTE PREVIEW
// -----------------------------
export const calculateRoute = (data) => {
    return api.post("/rides/calculate-route/", data);
};