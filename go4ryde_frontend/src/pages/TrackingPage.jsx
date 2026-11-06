import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MapView from "../components/MapView";
import api from "../utils/axiosInstance";
import { getMyBookings } from "../api/bookingService";

export default function RideTracking() {

    const { rideId } = useParams();
    const navigate = useNavigate();
    const [driverLocation, setDriverLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [allowed, setAllowed] = useState(false);
    const [error, setError] = useState("");

    // ============================
    // 🔐 CHECK ACCESS (IMPORTANT)
    // ============================
    useEffect(() => {
        checkAccess();
    }, []);

    const checkAccess = async () => {

    try {

        const role = localStorage.getItem("role");

        // DRIVER
        if (role === "DRIVER") {

            setAllowed(true);
            return;
        }

        // PASSENGER
        const res = await getMyBookings();

        const booking = res.data.find(
            (b) =>
                String(
                    b.ride_id || b.ride?.id
                ) === String(rideId)
        );

        if (!booking) {

            setError(
                "❌ You are not part of this ride"
            );

            return;
        }

        const status = (
            booking.status || ""
        ).toUpperCase();

        const canTrack =
            status === "STARTED";

        if (!canTrack) {

            setError(
                "⏳ Tracking available after ride starts"
            );

            return;
        }

        setAllowed(true);

    } catch (err) {

        console.error(err);

        setError(
            "Something went wrong"
        );

    } finally {

        setLoading(false);
    }
};
    // ============================
    // 📍 FETCH DRIVER LOCATION
    // ============================
    useEffect(() => {

        if (!allowed) return;

        let isMounted = true;

        const fetchLocation = async () => {
            try {
                const res = await api.get(`/tracking/driver-location/${rideId}/`);

                if (!isMounted) return;

                setDriverLocation({
                    lat: res.data.lat,
                    lng: res.data.lng
                });

            } catch (err) {
                console.error("❌ Location error:", err);
            }
        };

        // 🔥 FIRST CALL
        fetchLocation();

        // 🔁 POLLING
        const interval = setInterval(fetchLocation, 5000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };

    }, [rideId, allowed]);

    // ============================
    // ❌ INVALID
    // ============================
    if (!rideId) {
        return <div style={{ padding: "20px", color: "red" }}>Invalid Ride</div>;
    }

    // ============================
    // ⏳ LOADING
    // ============================
    if (loading) {
        return <div style={{ padding: "20px" }}>Loading tracking...</div>;
    }

    // ============================
    // 🚫 NOT ALLOWED
    // ============================
    if (!allowed) {
        return (
            <div style={{ padding: "20px" }}>
                <h3>{error}</h3>

                <button
                    onClick={() => navigate("/my-bookings")}
                    style={{
                        marginTop: "10px",
                        padding: "8px 12px",
                        background: "#2563eb",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer"
                    }}
                >
                    Go to My Bookings
                </button>
            </div>
        );
    }

    // ============================
    // ✅ TRACKING UI
    // ============================
    return (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>

            {/* 🔝 HEADER */}
            <div
                style={{
                    padding: "12px 16px",
                    background: "#0f172a",
                    color: "#fff",
                    display: "flex",
                    justifyContent: "space-between"
                }}
            >
                <div>🚗 Live Tracking</div>
                <div style={{ fontSize: "12px" }}>Ride #{rideId}</div>
            </div>

            {/* 📍 MAP */}
            <div style={{ flex: 1 }}>
                <MapView
                    currentLocation={
                        driverLocation || { lat: 17.385, lng: 78.486 }
                    }
                />
            </div>

            {/* 📍 STATUS BAR */}
            <div
                style={{
                    padding: "10px",
                    background: "#fff",
                    borderTop: "1px solid #ddd"
                }}
            >
                {driverLocation ? (
                    <p>
                        📍 Driver Location: {driverLocation.lat.toFixed(4)},{" "}
                        {driverLocation.lng.toFixed(4)}
                    </p>
                ) : (
                    <p>Waiting for driver location...</p>
                )}
            </div>
        </div>
    );
}