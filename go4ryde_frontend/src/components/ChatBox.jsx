import React, { useEffect, useState, useRef } from "react";
import { getMessages, markRead } from "../services/chatService";
import { createChatSocket } from "../sockets/chatSocket";

export default function ChatBox({ rideId }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [connected, setConnected] = useState(false);
    const [typingUser, setTypingUser] = useState(null);

    const socketRef = useRef(null);
    const bottomRef = useRef(null);
    const typingTimeout = useRef(null);

    const token = localStorage.getItem("access");
    const currentUserId = JSON.parse(atob(token.split(".")[1])).user_id;

    // 📩 LOAD + CONNECT
    useEffect(() => {
        if (!rideId) return;

        const loadMessages = async () => {
            try {
                const data = await getMessages(rideId);
                setMessages(data.reverse());
            } catch (err) {
                console.error("❌ Error loading messages", err);
            }
        };

        loadMessages();
        markRead(rideId).catch(() => { });

        socketRef.current = createChatSocket(
            rideId,
            token,
            (data) => {
                // 🎯 Handle different events
                if (data.typing !== undefined) {
                    setTypingUser(data.typing ? data.sender : null);
                    return;
                }

                if (data.read) {
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.sender === currentUserId
                                ? { ...msg, read: true }
                                : msg
                        )
                    );
                    return;
                }

                setMessages((prev) => [...prev, data]);
            }
        );

        // 🔄 Track connection
        const checkConnection = setInterval(() => {
            if (socketRef.current?.readyState === 1) {
                setConnected(true);
            } else {
                setConnected(false);
            }
        }, 500);

        return () => {
            clearInterval(checkConnection);
            socketRef.current?.close();
        };
    }, [rideId]);

    // 📤 SEND MESSAGE
    const sendMessage = () => {
        if (!input.trim()) return;

        const sent = socketRef.current?.send(
            JSON.stringify({ message: input })
        );

        if (sent) {
            setInput("");
            socketRef.current.sendTyping(false);
        }
    };

    // ⌨️ TYPING LOGIC (debounced)
    const handleTyping = (value) => {
        setInput(value);

        socketRef.current?.sendTyping(true);

        if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
        }

        typingTimeout.current = setTimeout(() => {
            socketRef.current?.sendTyping(false);
        }, 1500);
    };

    // ⌨️ ENTER SEND
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    };

    // 👁️ SEND READ RECEIPT
    useEffect(() => {
        socketRef.current?.sendRead();
    }, [messages]);

    // 🔽 AUTO SCROLL
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typingUser]);

    return (
        <div style={{ padding: "10px", maxWidth: "500px", margin: "auto" }}>

            {/* 🔌 STATUS */}
            <div style={{ marginBottom: "8px" }}>
                {connected ? "🟢 Online" : "🔴 Connecting..."}
            </div>

            {/* 💬 CHAT */}
            <div
                style={{
                    height: "400px",
                    overflowY: "auto",
                    border: "1px solid #ddd",
                    padding: "10px",
                    borderRadius: "10px",
                    background: "#f5f5f5",
                }}
            >
                {messages.map((msg, index) => {
                    const isMe = msg.sender === currentUserId;

                    return (
                        <div
                            key={index}
                            style={{
                                display: "flex",
                                justifyContent: isMe ? "flex-end" : "flex-start",
                                marginBottom: "8px",
                            }}
                        >
                            <div
                                style={{
                                    background: isMe ? "#0084ff" : "#e4e6eb",
                                    color: isMe ? "white" : "black",
                                    padding: "8px 12px",
                                    borderRadius: "15px",
                                    maxWidth: "70%",
                                }}
                            >
                                {msg.message}

                                {/* 👁️ READ RECEIPT */}
                                {isMe && (
                                    <div style={{ fontSize: "10px", marginTop: "2px" }}>
                                        {msg.read ? "✔✔" : "✔"}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* ⌨️ TYPING */}
                {typingUser && typingUser !== currentUserId && (
                    <div style={{ fontSize: "12px", color: "#888" }}>
                        typing...
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* ✍️ INPUT */}
            <div style={{ marginTop: "10px", display: "flex" }}>
                <input
                    value={input}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type message..."
                    style={{
                        flex: 1,
                        padding: "8px",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                    }}
                />

                <button
                    onClick={sendMessage}
                    disabled={!connected}
                    style={{
                        marginLeft: "8px",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        background: "#0084ff",
                        color: "white",
                        border: "none",
                    }}
                >
                    Send
                </button>
            </div>
        </div>
    );
}