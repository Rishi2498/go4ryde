import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MapView from "../components/feature/MapView";
import polyline from "@mapbox/polyline";
import { createBooking } from "../api/bookingService";
import Toast from "../components/Toast";
import "../css/pages/RideRoute.css";

export default function RideRoutePage() {
    const navigate = useNavigate();
    const { state: ride } = useLocation();

    const [seats, setSeats] = useState(1);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [isPanelOpen, setIsPanelOpen] = useState(true);

    if (!ride) return <p>No route data</p>;

    const decoded = ride.route_geometry
        ? polyline.decode(ride.route_geometry).map((p) => ({
            lat: p[0],
            lng: p[1],
        }))
        : [];

    const remainingSeats = ride.seats_remaining ?? 0;

const status = ride.status?.toLowerCase();

const isFull = remainingSeats <= 0;
const isCompleted = status === "completed";
const isCancelled = status === "cancelled";
const isStarted = status === "started";
const isActive = status === "active";

const canBook =
    !isFull &&
    !isCompleted &&
    !isCancelled &&
    !isStarted&&
    !isActive;

    // BOOK RIDE
    const handleBooking = async () => {

          if (!canBook) {
        return setToast({
            message: `Ride is ${ride.status}`,
            type: "error",
        });
    }
        if (seats <= 0) {
            return setToast({
                message: "Invalid seats",
                type: "error",
            });
        }

        if (seats > remainingSeats) {
            return setToast({
                message: "Not enough seats",
                type: "error",
            });
        }

        try {
            setLoading(true);

            const res = await createBooking({
                ride: ride.id,
                seats,
            });

            setToast({
                message: "Booking Successful ✅",
                type: "success",
            });

            navigate(`/payment/${res.data.booking_id}`);
        } catch (err) {
            setToast({
                message:
                    err.response?.data?.error ||
                    "Booking failed",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="route-layout">
            
            {/* FLOATING BACK BUTTON */}
            <button className="floating-back-btn" onClick={() => navigate(-1)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>

            {/* MAP */}
            <div className={`route-map-section ${isPanelOpen ? 'panel-open' : 'panel-closed'}`}>
                <MapView
                    height="100%"
                    source={{
                        lat: ride.source_lat,
                        lng: ride.source_lng,
                    }}
                    destination={{
                        lat: ride.destination_lat,
                        lng: ride.destination_lng,
                    }}
                    polyline={decoded}
                />
                
                {/* Desktop toggle button */}
                <button 
                    className={`panel-toggle-btn ${isPanelOpen ? 'hidden' : ''}`}
                    onClick={() => setIsPanelOpen(true)}
                >
                    Show Ride Details
                </button>
            </div>

            {/* BOTTOM SHEET / SIDEBAR */}
            <div className={`route-sheet ${isPanelOpen ? '' : 'closed'}`}>
                
                <div 
                    className="sheet-handle-area" 
                    onClick={() => setIsPanelOpen(!isPanelOpen)}
                >
                    <div className="sheet-handle"></div>
                    {!isPanelOpen && <p className="sheet-preview-text">Tap to view details</p>}
                </div>

                <button 
                    className="desktop-close-btn" 
                    onClick={() => setIsPanelOpen(false)}
                >
                    ✕
                </button>

                <div className="sheet-scroll">
                    
                    {/* ROUTE VISUALIZATION */}
                    <div className="uber-route-card">
                        <div className="route-timeline">
                            <div className="dot source-dot"></div>
                            <div className="line"></div>
                            <div className="dot dest-dot"></div>
                        </div>
                        <div className="route-places">
                            <div className="place">
                                <h4>Pickup</h4>
                                <p>{ride.source}</p>
                            </div>
                            <div className="place">
                                <h4>Dropoff</h4>
                                <p>{ride.destination}</p>
                            </div>
                        </div>
                    </div>

                    {/* DRIVER & CAR INFO */}
                    <div className="uber-driver-card">
                        <div className="driver-info-left">
                            <div className="driver-avatar-img">
                                {ride.driver_name?.charAt(0) || "D"}
                            </div>
                            <div className="driver-text">
                                <h4>{ride.driver_name || "Driver"}</h4>
                                <span>⭐ 4.9 • Verified</span>
                            </div>
                        </div>
                        <div className="car-info">
                            <h4>{ride.car_model || "Hatchback"}</h4>
                            <span className="plate">{ride.car_number || "XX 00 XX 0000"}</span>
                        </div>
                    </div>

                    {/* RIDE STATS */}
                    <div className="uber-stats">
                        <div className="stat">
                            <span className="icon">📏</span>
                            <strong>{ride.distance_km || "N/A"} km</strong>
                            <label>Distance</label>
                        </div>
                        <div className="stat">
                            <span className="icon">⏱</span>
                            <strong>{ride.duration_min || "N/A"} min</strong>
                            <label>Duration</label>
                        </div>
                        <div className="stat">
                            <span className="icon">🪑</span>
                            <strong>{remainingSeats} Left</strong>
                            <label>Seats</label>
                        </div>
                    </div>

                    {/* BOOKING SECTION */}
                    {!canBook ? (
    <div className="full-booked-banner">

        {isFull && "🚫 This ride is currently full."}

        {isCompleted && "✅ This ride has been completed."}

        {isCancelled && "❌ This ride was cancelled."}

        {isStarted && "🚗 This ride has already started."}

        {isActive && "🚦 This ride is active and not accepting passengers."}

    </div>
) : (
                        <div className="uber-booking-section">
                            <div className="price-seat-row">
                                <div className="price-col">
                                    <label>Total Price</label>
                                    <h2>₹{ride.price_per_seat * seats}</h2>
                                </div>
                                <div className="seat-selector">
                                    <button 
                                        onClick={() => setSeats(prev => Math.max(1, prev - 1))}
                                        disabled={seats <= 1}
                                    >-</button>
                                    <span>{seats} {seats === 1 ? 'Seat' : 'Seats'}</span>
                                    <button 
                                        onClick={() => setSeats(prev => Math.min(remainingSeats, prev + 1))}
                                        disabled={seats >= remainingSeats}
                                    >+</button>
                                </div>
                            </div>

                            <button
    className="uber-book-btn"
    onClick={handleBooking}
    disabled={!canBook || loading}
>
    {loading
        ? "Processing..."
        : "Confirm Booking"}
</button>
                        </div>
                    )}
                </div>
            </div>

            {/* TOAST */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}