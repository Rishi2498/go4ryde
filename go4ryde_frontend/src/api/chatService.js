import api from "../utils/axiosInstance";

export const getMessages = (bookingId) =>
    api.get(`/chat/${bookingId}/`);

export const sendMessage = (bookingId, message) =>
    api.post(`/chat/send/${bookingId}/`, {
        message
    });

export const markRead = (bookingId) =>
    api.post(`/chat/read/${bookingId}/`);