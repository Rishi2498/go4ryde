import React, { useEffect, useState } from "react";
import api from "../utils/axiosInstance";

export default function ChatBox({ bookingId }) {

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");

    // =========================
    // LOAD MESSAGES
    // =========================
    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {

        try {

            const res = await api.get(`/chat/${bookingId}/`);

            console.log("MESSAGES:", res.data);

            setMessages(res.data);

        } catch (err) {
            console.log(err);
        }
    };

    // =========================
    // SEND MESSAGE
    // =========================
    const sendMessage = async () => {

        if (!text.trim()) return;

        try {

            const res = await api.post(
                `/chat/send/${bookingId}/`,
                {
                    message: text
                }
            );

            console.log("SENT:", res.data);

            // ✅ ADD NEW MESSAGE TO UI
const role = localStorage.getItem("role");

setMessages((prev) => [
    ...prev,
    {
        ...res.data,
        sender_role: role,
        created_at: res.data.timestamp,
    },
]);
            setText("");

        } catch (err) {

            console.log(err);

            alert(
                err.response?.data?.error ||
                "Failed to send"
            );
        }
    };

   return (
    <div className="chat-box">

        <div className="messages">

            {messages.length === 0 ? (

                <div className="empty-chat">
                    Start your conversation 👋
                </div>

            ) : (

                messages.map((msg, index) => {

                    const isMine =
                        String(msg.sender_role).toUpperCase() ===
                        String(localStorage.getItem("role")).toUpperCase();

                    return (

                        <div
                            key={msg.id || index}
                            className={`message-row ${
                                isMine ? "sent" : "received"
                            }`}
                        >

                            <div className="message-bubble">

                                <div className="message-sender">
                                    {isMine
                                        ? "You"
                                        : msg.sender_role === "DRIVER"
                                        ? "Driver"
                                        : "Passenger"}
                                </div>

                                <div className="message-text">
                                    {msg.message || msg.text}
                                </div>

                                <div className="message-time">
                                    {msg.created_at
                                        ? new Date(
                                              msg.created_at
                                          ).toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                          })
                                        : ""}
                                </div>

                            </div>

                        </div>

                    );
                })

            )}

        </div>

        <div className="chat-input">

            <input
                type="text"
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        sendMessage();
                    }
                }}
            />

            <button onClick={sendMessage}>
                ➤
            </button>

        </div>

    </div>
);
}