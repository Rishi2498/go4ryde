import React, { useEffect, useState, useRef } from "react";
import { getMessages, markRead } from "../api/chatService";
import { createChatSocket } from "../sockets/chatSocket";

export default function ChatBox({ rideId }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const socketRef = useRef(null);

    const token = localStorage.getItem("access");

    // 📩 Load initial messages
    useEffect(() => {
        getMessages(rideId).then((res) => {
            setMessages(res.data.reverse());
        });

        markRead(rideId);

        // 🌐 Connect WebSocket
        socketRef.current = createChatSocket(
            rideId,
            token,
            (data) => {
                setMessages((prev) => [...prev, data]);
            }
        );

        return () => {
            socketRef.current.close();
        };
    }, [rideId]);

    // 📤 Send message
    const sendMessage = () => {
        if (!input.trim()) return;

        socketRef.current.send(
            JSON.stringify({ message: input })
        );

        setInput("");
    };

    return (
        <div style={{ padding: "10px" }}>
            <div style={{ height: "300px", overflowY: "auto" }}>
                {messages.map((msg, index) => (
                    <div key={index}>
                        <b>{msg.sender}</b>: {msg.message}
                    </div>
                ))}
            </div>

            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type message..."
            />

            <button onClick={sendMessage}>Send</button>
        </div>
    );
}