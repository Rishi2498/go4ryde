import api from "../utils/axiosInstance";

// 🚀 CREATE BOOKING
export const createBooking = (data) => {
    return api.post("/bookings/create/", data);
};

// ✅ MY BOOKINGS
export const getMyBookings = () => {
    return api.get("/bookings/my-bookings/");
};

// ✅ CANCEL BOOKING
export const cancelBooking = (id) => {
    return api.post(`/bookings/cancel/${id}/`);
};