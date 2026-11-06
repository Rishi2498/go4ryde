import React, { useEffect, useState } from "react";
import { getMyBookings, cancelBooking } from "../api/bookingService";
import { useNavigate } from "react-router-dom";
import "../css/pages/MyBookings.css";

export default function MyBookings() {

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // =========================
    // LOAD BOOKINGS
    // =========================
    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await getMyBookings();
            setBookings(res.data || []);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    // =========================
    // CANCEL BOOKING
    // =========================
    const handleCancel = async (id) => {
        try {
            await cancelBooking(id);

            // ✅ Refresh bookings
            await fetchBookings();

            // ✅ Refresh rides globally
            window.dispatchEvent(new Event("ridesUpdated"));

            alert("Booking cancelled");

        } catch (err) {
            console.error("Cancel error:", err.response?.data || err.message);

            alert(
                err.response?.data?.error ||
                "Cannot cancel this booking"
            );
        }
    };

    return (
        <div className="bookings-wrapper">

            <h2 className="title">My Bookings</h2>

            {loading && <p className="info">Loading...</p>}

            {!loading && bookings.length === 0 && (
                <p className="info">No bookings found</p>
            )}

            <div className="booking-list">

                {bookings
                    // ❌ Remove cancelled from UI
                    .filter(b => (b.status || "").toLowerCase() !== "cancelled")
                    .map((b) => {

                        const status = (b.status || "").toLowerCase();
                        const paymentStatus = (b.payment_status || "").toLowerCase();

                        const rideId = b.ride_id || b.ride?.id;

                        const showTracking = ["started", "active"].includes(status);
                        const showChat = ["confirmed", "accepted", "started", "active"].includes(status);

                        // =========================
                        // ✅ FIXED PAYMENT LOGIC
                        // =========================
                        const needsPayment =
                            paymentStatus !== "paid" &&
                            paymentStatus !== "pending" &&
                            status !== "cancelled";

                        const isPaymentPending = paymentStatus === "pending";

                        return (
                            <div key={b.id} className="booking-card">

                                {/* LEFT */}
                                <div className="booking-left">

                                    <h3 className="ride-title">
                                        {b.ride || "Ride"}
                                    </h3>

                                    <p className="price">₹{b.amount ?? 0}</p>

                                    <span className={`status ${status}`}>
                                        {b.status}
                                    </span>

                                    {/* 💳 Payment Messages */}
                                    {needsPayment && (
                                        <p className="pending-pay">
                                            ⚠️ Complete payment to confirm booking
                                        </p>
                                    )}

                                    {isPaymentPending && (
                                        <p className="pending-pay">
                                            ⏳ Payment already started
                                        </p>
                                    )}

                                </div>

                                {/* RIGHT */}
                                <div className="booking-actions">

                                    {/* 💳 PAY */}
                                    {needsPayment && (
                                        <button
                                            onClick={() => navigate(`/payment/${b.id}`)}
                                            className="btn-primary"
                                        >
                                            Pay
                                        </button>
                                    )}

                                    {/* 🚗 TRACK */}
                                    {showTracking && (
                                        <button
                                            onClick={() => navigate(`/tracking/${rideId}`)}
                                            className="btn-outline"
                                        >
                                            Tracking
                                        </button>
                                    )}

                                    {/* 👁 VIEW DETAILS */}
<button
    onClick={() =>
        navigate(`/booking/${b.id}`, {
            state: b
        })
    }
    className="btn-outline"
>
    View Details
</button>

                                    {/* ❌ CANCEL */}
                                    {status === "pending" && (
                                        <button
                                            onClick={() => handleCancel(b.id)}
                                            className="btn-danger"
                                        >
                                            Cancel
                                        </button>
                                    )}

                                </div>

                            </div>
                        );
                    })}

            </div>
        </div>
    );
}