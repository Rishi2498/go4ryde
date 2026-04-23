import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8000/api",
});

// ✅ Attach JWT token
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("access");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

console.log("✅ chatService loaded");


/**
 * 🧠 Normalize backend + WebSocket messages
 */
const normalizeMessage = (msg) => {
    return {
        id: msg.id,

        // 💬 message text
        message: msg.message || msg.text || "",

        // 👤 sender
        sender_id: msg.sender || msg.sender_id || null,
        sender_email: msg.sender_email || msg.sender || "",

        // 🕒 timestamp
        timestamp: msg.timestamp || msg.created_at || new Date().toISOString(),

        // 👁️ read status
        is_read: msg.is_read ?? false,

        // 📦 delivery status (WhatsApp style)
        status: msg.status || (msg.is_read ? "read" : "sent"),
    };
};


/**
 * 📩 GET messages
 */
export const getMessages = async (rideId) => {
    try {
        const res = await API.get(`/chat/${rideId}/messages/`);

        return res.data.map(normalizeMessage);

    } catch (error) {
        console.error(
            "❌ getMessages error:",
            error.response?.data || error.message
        );
        throw error;
    }
};


/**
 * 👁️ Mark messages as read
 */
export const markRead = async (rideId) => {
    try {
        const res = await API.post(`/chat/${rideId}/read/`);
        return res.data;

    } catch (error) {
        console.error(
            "❌ markRead error:",
            error.response?.data || error.message
        );
        throw error;
    }
};


/**
 * 📤 Send message (API fallback if WS fails)
 */
export const sendMessageAPI = async (rideId, message) => {
    try {
        const res = await API.post(`/chat/${rideId}/send/`, { message });

        return normalizeMessage({
            ...res.data,
            status: "sent", // fallback
        });

    } catch (error) {
        console.error(
            "❌ sendMessage error:",
            error.response?.data || error.message
        );
        throw error;
    }
};


/**
 * 🔄 Convert WebSocket message → UI format
 */
export const handleSocketMessage = (data) => {
    return normalizeMessage(data);
};