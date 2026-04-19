import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8000/api",
});

// ✅ Add token automatically
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("access");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 📩 Get messages
export const getMessages = (rideId) =>
    API.get(`/chat/${rideId}/messages/`);

// ✅ Mark read
export const markRead = (rideId) =>
    API.post(`/chat/${rideId}/read/`);

// 📤 Fallback send
export const sendMessageAPI = (rideId, message) =>
    API.post(`/chat/${rideId}/send/`, { message });