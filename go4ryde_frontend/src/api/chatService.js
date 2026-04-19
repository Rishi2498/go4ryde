import api from "../utils/axiosInstance";

// 📩 GET HISTORY
export const getChatMessages = (rideId) =>
    api.get(`/chat/${rideId}/messages/`);

// ✅ MARK READ
export const markMessagesRead = (rideId) =>
    api.post(`/chat/${rideId}/read/`);