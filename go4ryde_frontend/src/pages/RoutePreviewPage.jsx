import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MapView from "../components/feature/MapView";
import { getRides } from "../services/rideService";

export default function RoutePreviewPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const [source, setSource] = useState(null);
    const [destination, setDestination] = useState(null);
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(false);

    // ============================
    // 🔥 LOAD SOURCE & DESTINATION
    // ============================
    useEffect(() => {
        let data = location.state;

        if (!data) {
            data = JSON.parse(localStorage.getItem("ride_search"));
        }

        if (!data) {
            alert("Please select route first");
            navigate("/");
            return;
        }

        setSource(data.source);
        setDestination(data.destination);

    }, [location, navigate]);

    // ============================
    // 🚀 FETCH RIDES
    // ============================
    useEffect(() => {
        if (!source || !destination) return;

        const fetchRides = async () => {
            try {
                setLoading(true);

                const res = await getRides({
                    source_lat: source.lat,
                    source_lng: source.lng,
                    destination_lat: destination.lat,
                    destination_lng: destination.lng,
                });

                console.log("🔥 RIDES RESPONSE:", res);

                // ✅ IMPORTANT FIX
                setRides(res.data || []);

            } catch (err) {
                console.error("❌ Ride fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRides();

    }, [source, destination]);

    return (
        <div style={{ padding: "20px" }}>
            <h2>🗺 Route Preview</h2>

            {/* 🗺️ MAP (LOCKED VIEW) */}
            <MapView
                source={source}
                destination={destination}
            />

            {/* 🚗 RIDE LIST */}
            <div style={{ marginTop: "20px" }}>
                <h3>Available Rides</h3>

                {loading ? (
                    <p>Loading rides...</p>
                ) : (rides || []).length === 0 ? (
                    <p>❌ No rides found</p>
                ) : (
                    rides.map((ride) => (
                        <div
                            key={ride.id}
                            style={{
                                border: "1px solid #ddd",
                                padding: "12px",
                                marginBottom: "10px",
                                borderRadius: "8px",
                                background: "#f9f9f9"
                            }}
                        >
                            <p><b>{ride.source} → {ride.destination}</b></p>

                            <p>💰 ₹{ride.price_per_seat}</p>
                            <p>📏 {ride.distance_km} km</p>
                            <p>⏱ {ride.duration_min} min</p>
                            <p>🪑 Seats: {ride.seats_remaining}</p>

                            <button
                                onClick={() =>
                                    navigate(`/ride/${ride.id}/route`, {
                                        state: ride // ✅ CRITICAL FIX
                                    })
                                }
                                style={{
                                    marginTop: "10px",
                                    padding: "8px 12px",
                                    background: "#10b981",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer"
                                }}
                            >
                                View Route
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}