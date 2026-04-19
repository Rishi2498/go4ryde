import React, { useEffect, useState } from "react";
import { getMyBookings, cancelBooking } from "../api/bookingService";
import { useNavigate } from "react-router-dom";

export default function MyBookings() {

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await getMyBookings();

            console.log("📦 BOOKINGS:", res.data);

            setBookings(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("❌ Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm("Are you sure you want to cancel?")) return;

        try {
            await cancelBooking(id);
            alert("Booking cancelled ❌");
            fetchBookings();
        } catch (err) {
            alert(err.response?.data?.error || "Cannot cancel");
        }
    };

    return (
        <div style={{ maxWidth: "900px", margin: "auto", padding: "20px" }}>
            <h2>🚗 My Bookings</h2>

            {loading && <p>Loading bookings...</p>}

            {!loading && bookings.length === 0 && (
                <p>No bookings found</p>
            )}

            {bookings.map((b) => {

                // 🔥 NORMALIZE
                const status = (b.status || "").toUpperCase();
                const paymentStatus = (b.payment_status || "").toUpperCase();

                // 🔥 SAFE rideId extraction
                const rideId =
                    b.ride_id ||
                    b.ride?.id ||
                    (typeof b.ride === "number" ? b.ride : null);

                // 🔥 CORE LOGIC (MATCH DRIVER SIDE)
                // 🚗 tracking only when ride live
                const isRideLive = ["STARTED", "ACTIVE"].includes(status);

                // 💬 chat allowed earlier (IMPORTANT FIX)
                const canChatStatus = ["CONFIRMED", "ACCEPTED", "STARTED", "ACTIVE"];

                const showTracking = rideId && isRideLive;
                const showChat = rideId && canChatStatus.includes(status);
                {
                    status === "CONFIRMED" && (
                        <p style={{ color: "purple" }}>
                            💬 Booking confirmed — chat available
                        </p>
                    )
                }

                {
                    status === "ACCEPTED" && (
                        <p style={{ color: "orange" }}>
                            💬 Driver accepted — chat enabled
                        </p>
                    )
                }

                console.log("🔍 DEBUG:", {
                    bookingId: b.id,
                    status,
                    rideId,
                    showTracking,
                    showChat
                });

                const statusColor =
                    status === "COMPLETED" ? "green" :
                        isRideLive ? "#2563eb" :
                            status === "ACCEPTED" ? "orange" :
                                status === "CANCELLED" ? "red" :
                                    "black";

                return (
                    <div
                        key={b.id}
                        style={{
                            border: "1px solid #ccc",
                            margin: "15px 0",
                            padding: "15px",
                            borderRadius: "10px"
                        }}
                    >
                        {/* 🚘 RIDE */}
                        <h3>{b.ride || "Ride"}</h3>

                        <p>💰 ₹{b.amount ?? 0}</p>

                        <p style={{ color: statusColor }}>
                            📌 Status: {status}
                        </p>

                        <p>💳 Payment: {paymentStatus || "N/A"}</p>

                        {/* 🚗 LIVE TRACKING */}
                        {showTracking && (
                            <button
                                onClick={() => {
                                    console.log("🚗 Navigate tracking:", rideId);
                                    navigate(`/tracking/${rideId}`);
                                }}
                                style={{
                                    background: "#2563eb",
                                    color: "white",
                                    padding: "8px 12px",
                                    border: "none",
                                    borderRadius: "6px",
                                    marginRight: "10px",
                                    cursor: "pointer"
                                }}
                            >
                                🚗 Live Tracking
                            </button>
                        )}

                        {/* 💬 CHAT */}
                        {showChat && (
                            <button
                                onClick={() => {
                                    console.log("💬 Navigate chat:", rideId);
                                    navigate(`/chat/${rideId}`);
                                }}
                                style={{
                                    background: "green",
                                    color: "white",
                                    padding: "8px 12px",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer"
                                }}
                            >
                                💬 Chat
                            </button>
                        )}

                        {/* ❌ CANCEL */}
                        {status === "PENDING" && (
                            <button
                                onClick={() => handleCancel(b.id)}
                                style={{
                                    background: "red",
                                    color: "white",
                                    padding: "6px 10px",
                                    border: "none",
                                    borderRadius: "5px",
                                    marginLeft: "10px",
                                    cursor: "pointer"
                                }}
                            >
                                Cancel Booking
                            </button>
                        )}

                        {/* 📊 STATUS INFO */}
                        {status === "ACCEPTED" && (
                            <p style={{ color: "orange" }}>
                                ⏳ Waiting for driver
                            </p>
                        )}

                        {status === "STARTED" && (
                            <p style={{ color: "#2563eb" }}>
                                🚗 Ride started — tracking & chat enabled
                            </p>
                        )}

                        {status === "ACTIVE" && (
                            <p style={{ color: "#2563eb" }}>
                                📍 Ride in progress
                            </p>
                        )}

                        {status === "COMPLETED" && (
                            <p style={{ color: "green" }}>
                                ✅ Ride completed
                            </p>
                        )}

                        {status === "CANCELLED" && (
                            <p style={{ color: "red" }}>
                                ❌ Cancelled
                            </p>
                        )}

                        {/* 🔍 DEBUG */}
                        <p style={{ fontSize: "11px", color: "gray" }}>
                            Debug → status: {b.status} | rideId: {rideId}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}