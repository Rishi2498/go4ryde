import React, { useEffect, useState } from "react";
import { getRides } from "../services/rideService";
import { createBooking } from "../api/bookingService";
import { useNavigate } from "react-router-dom";

export default function RideListPage() {
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(false);

    // 🔥 per-ride state
    const [seats, setSeats] = useState({});
    const [bookingLoading, setBookingLoading] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchRides();
    }, []);

    const fetchRides = async () => {
        try {
            setLoading(true);

            const res = await getRides({});
            console.log("🔥 RIDES:", res);

            setRides(res.data || []);

        } catch (err) {
            console.error("❌ Error fetching rides", err);
        } finally {
            setLoading(false);
        }
    };

    // ============================
    // 🚀 HANDLE BOOKING
    // ============================
    const handleBooking = async (rideId) => {

        const selectedSeats = seats[rideId] || 1;

        try {
            setBookingLoading(rideId);

            const res = await createBooking({
                ride: rideId,
                seats: selectedSeats
            });

            console.log("✅ Booking:", res);

            alert("Booking Created ✅");

            // 👉 Redirect to MyBookings (or payment later)
            navigate("/my-bookings");

        } catch (err) {
            alert(err.response?.data?.error || "Booking failed");
        } finally {
            setBookingLoading(null);
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>🚗 All Available Rides</h2>

            {loading ? (
                <p>Loading...</p>
            ) : rides.length === 0 ? (
                <p>No rides found</p>
            ) : (
                rides.map((ride) => (
                    <div
                        key={ride.id}
                        style={{
                            border: "1px solid #ddd",
                            padding: "12px",
                            marginBottom: "10px",
                            borderRadius: "8px",
                        }}
                    >
                        <h4>{ride.source} → {ride.destination}</h4>

                        <p>💰 ₹{ride.price_per_seat}</p>
                        <p>📏 {ride.distance_km} km</p>
                        <p>⏱ {ride.duration_min} min</p>
                        <p>🪑 Seats Available: {ride.seats_remaining}</p>

                        {/* 🪑 SELECT SEATS */}
                        <input
                            type="number"
                            min="1"
                            max={ride.seats_remaining}
                            value={seats[ride.id] || 1}
                            onChange={(e) =>
                                setSeats({
                                    ...seats,
                                    [ride.id]: Number(e.target.value)
                                })
                            }
                            style={{
                                width: "60px",
                                marginRight: "10px"
                            }}
                        />

                        {/* 🚀 BOOK BUTTON */}
                        <button
                            onClick={() => handleBooking(ride.id)}
                            disabled={bookingLoading === ride.id}
                            style={{
                                background: "#16a34a",
                                color: "white",
                                padding: "6px 12px",
                                borderRadius: "5px",
                                border: "none",
                                cursor: "pointer",
                                marginRight: "10px"
                            }}
                        >
                            {bookingLoading === ride.id
                                ? "Booking..."
                                : "🚀 Book Ride"}
                        </button>

                        {/* 🗺 VIEW ROUTE */}
                        <button
                            onClick={() =>
                                navigate(`/ride/${ride.id}/route`, {
                                    state: ride
                                })
                            }
                            style={{
                                padding: "6px 10px",
                                borderRadius: "5px",
                                cursor: "pointer"
                            }}
                        >
                            View Route
                        </button>
                    </div>
                ))
            )}
        </div>
    );
} 