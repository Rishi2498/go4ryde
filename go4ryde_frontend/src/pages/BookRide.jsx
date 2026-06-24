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
            setBookings(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("❌ Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm("Cancel this booking?")) return;

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

                const status = (b.status || "").toUpperCase();
                const paymentStatus = (b.payment_status || "").toUpperCase();

                const rideId =
                    b.ride_id ||
                    b.ride?.id ||
                    (typeof b.ride === "number" ? b.ride : null);

                // ============================
                // 🔥 LOGIC (FIXED)
                // ============================


                const needsPayment =
                    paymentStatus !== "paid" &&
                    paymentStatus !== "pending";

                const canChat =
                    ["CONFIRMED", "ACCEPTED", "STARTED", "ACTIVE"].includes(status);

                const canTrack =
                    ["STARTED", "ACTIVE"].includes(status);

                const canCancel =
                    status === "PENDING";

                // 🎨 STATUS COLORS
                const statusColor =
                    status === "COMPLETED" ? "green" :
                        ["STARTED", "ACTIVE"].includes(status) ? "#2563eb" :
                            ["ACCEPTED", "CONFIRMED"].includes(status) ? "purple" :
                                status === "CANCELLED" ? "red" :
                                    "black";

                return (
                    <div
                        key={b.id}
                        style={{
                            border: "1px solid #ddd",
                            margin: "15px 0",
                            padding: "15px",
                            borderRadius: "10px",
                            background: status === "CANCELLED" ? "#fef2f2" : "#fff"
                        }}
                    >
                        <h3>{b.ride || "Ride"}</h3>

                        <p>💰 ₹{b.amount ?? 0}</p>

                        <p style={{ color: statusColor }}>
                            📌 Status: {status}
                        </p>

                        <p>💳 Payment: {paymentStatus || "N/A"}</p>

                        {/* ============================
                           💳 PAYMENT (NEW)
                        ============================ */}
                        {needsPayment && (
                            <button
                                onClick={() => navigate(`/payment/${b.id}`)}
                                style={{
                                    background: "#f59e0b",
                                    color: "white",
                                    padding: "8px 12px",
                                    border: "none",
                                    borderRadius: "6px",
                                    marginRight: "10px",
                                    cursor: "pointer"
                                }}
                            >
                                💳 Pay Now
                            </button>
                        )}

                        {/* ============================
                           💬 CHAT (FIXED)
                        ============================ */}
                        {canChat && rideId && (
                            <button
                                onClick={() => navigate(`/chat/${b.id}`)}
                                style={{
                                    background: "green",
                                    color: "white",
                                    padding: "8px 12px",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    marginRight: "10px"
                                }}
                            >
                                💬 Chat
                            </button>
                        )}

                        {/* ============================
                           📍 TRACKING (STRICT)
                        ============================ */}
                        {canTrack && rideId && (
                            <button
                                onClick={() => navigate(`/tracking/${rideId}`)}
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

                        {/* ============================
                           ❌ CANCEL
                        ============================ */}
                        {canCancel && (
                            <button
                                onClick={() => handleCancel(b.id)}
                                style={{
                                    background: "red",
                                    color: "white",
                                    padding: "6px 10px",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: "pointer"
                                }}
                            >
                                Cancel
                            </button>
                        )}

                        {/* ============================
                           🧠 USER GUIDANCE (UX)
                        ============================ */}
                        {needsPayment && (
                            <p style={{ color: "#f59e0b" }}>
                                ⚠️ Complete payment to confirm booking
                            </p>
                        )}

                        {status === "CONFIRMED" && (
                            <p style={{ color: "purple" }}>
                                ✅ Driver confirmed — chat enabled
                            </p>
                        )}

                        {status === "STARTED" && (
                            <p style={{ color: "#2563eb" }}>
                                🚗 Ride started — tracking enabled
                            </p>
                        )}

                        {status === "COMPLETED" && (
                            <p style={{ color: "green" }}>
                                🎉 Ride completed
                            </p>
                        )}

                        {status === "CANCELLED" && (
                            <p style={{ color: "red" }}>
                                ❌ Booking cancelled
                            </p>
                        )}
                    </div>
                );
            })}
        </div>
    );
}