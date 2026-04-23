import React from "react";
import { useParams } from "react-router-dom";
import ChatBox from "../components/ChatBox";

export default function RideChatPage() {
    const { rideId } = useParams();

    if (!rideId) {
        return (
            <div style={{ padding: "20px", color: "red" }}>
                ❌ Invalid Ride
            </div>
        );
    }

    return (
        <div
            style={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                background: "#f5f7fb",
            }}
        >
            {/* 🔝 HEADER (Rapido style) */}
            <div
                style={{
                    padding: "12px 16px",
                    background: "#0f172a",
                    color: "#fff",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                }}
            >
                <div>
                    🚗 Ride Chat
                </div>

                <div style={{ fontSize: "12px", opacity: 0.8 }}>
                    Ride ID: {rideId}
                </div>
            </div>

            {/* 💬 CHAT AREA */}
            <div style={{ flex: 1, overflow: "hidden" }}>
                <ChatBox rideId={rideId} />
            </div>
        </div>
    );
}