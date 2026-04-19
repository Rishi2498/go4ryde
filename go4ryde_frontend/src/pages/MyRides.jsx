import React, { useEffect, useState, useRef } from "react";
import { getMyRides } from "../api/rideService";
import api from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function MyRides() {

    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // 🔥 WebSocket + GPS refs
    const socketRef = useRef(null);
    const watchIdRef = useRef(null);

    useEffect(() => {
        fetchRides();

        return () => stopTracking(); // cleanup
    }, []);

    const fetchRides = async () => {
        try {
            setLoading(true);
            const res = await getMyRides();
            setRides(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const acceptBooking = async (bookingId) => {
        try {
            await api.post(`/bookings/accept/${bookingId}/`);
            alert("Booking Accepted ✅");
            fetchRides();
        } catch (err) {
            alert("Error accepting");
        }
    };

    // 🚗 START TRACKING (WEBSOCKET + GPS)
    const startTracking = (rideId) => {

        stopTracking(); // 🔥 prevent duplicates

        socketRef.current = new WebSocket(
            `ws://127.0.0.1:8000/ws/tracking/${rideId}/`
        );

        socketRef.current.onopen = () => {
            console.log("✅ Tracking Connected");
        };

        socketRef.current.onerror = (err) => {
            console.error("❌ WebSocket Error:", err);
        };

        socketRef.current.onclose = () => {
            console.log("🔌 Tracking Closed");
        };

        let lastSent = 0;

        watchIdRef.current = navigator.geolocation.watchPosition((pos) => {

            const now = Date.now();

            if (now - lastSent > 1000) { // throttle
                const coords = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                };

                if (socketRef.current?.readyState === WebSocket.OPEN) {
                    socketRef.current.send(JSON.stringify(coords));
                }

                lastSent = now;
            }

        }, (err) => {
            console.error("GPS error:", err);
        });
    };

    // 🛑 STOP TRACKING
    const stopTracking = () => {

        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }

        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }

        console.log("🛑 Tracking stopped");
    };

    // 🚗 START RIDE
    const startRide = async (bookingId, rideId) => {
        try {
            await api.post(`/bookings/start/${bookingId}/`);
            alert("Ride Started 🚗");

            startTracking(rideId);

            navigate(`/tracking/${rideId}`);

        } catch (err) {
            alert("Error starting ride");
        }
    };

    return (
        <div style={{ maxWidth: "900px", margin: "auto", padding: "20px" }}>
            <h2>🚗 My Rides (Driver)</h2>

            {loading && <p>Loading...</p>}

            {rides.map((ride) => {

                const rideStatus = (ride.status || "").toUpperCase();

                return (
                    <div key={ride.id} style={{
                        border: "1px solid #ccc",
                        margin: "15px 0",
                        padding: "15px",
                        borderRadius: "10px"
                    }}>
                        <h3>{ride.source} → {ride.destination}</h3>
                        <p>📌 Ride Status: {rideStatus}</p>

                        {/* 🔥 DRIVER CONTROLS */}
                        {["STARTED", "ACTIVE"].includes(rideStatus) && (
                            <div style={{ marginBottom: "10px" }}>

                                <button
                                    onClick={() => navigate(`/tracking/${ride.id}`)}
                                    style={{
                                        background: "#2563eb",
                                        color: "white",
                                        padding: "6px 10px",
                                        borderRadius: "5px",
                                        marginRight: "10px"
                                    }}
                                >
                                    🚗 View Live Ride
                                </button>

                                <button
                                    onClick={() => navigate(`/chat/${ride.id}`)}
                                    style={{
                                        background: "green",
                                        color: "white",
                                        padding: "6px 10px",
                                        borderRadius: "5px",
                                        marginRight: "10px"
                                    }}
                                >
                                    💬 Chat
                                </button>

                                <button
                                    onClick={stopTracking}
                                    style={{
                                        background: "red",
                                        color: "white",
                                        padding: "6px 10px",
                                        borderRadius: "5px"
                                    }}
                                >
                                    🛑 Stop Tracking
                                </button>
                            </div>
                        )}

                        {/* 🔥 BOOKINGS */}
                        {ride.bookings?.map((b) => {

                            const status = (b.status || "").toUpperCase();

                            return (
                                <div key={b.id} style={{ marginTop: "10px" }}>
                                    <p>👤 {b.user_email}</p>
                                    <p>Status: {status}</p>

                                    {status === "PENDING" && (
                                        <button onClick={() => acceptBooking(b.id)}>
                                            Accept
                                        </button>
                                    )}

                                    {status === "ACCEPTED" && (
                                        <button onClick={() => startRide(b.id, ride.id)}>
                                            Start Ride 🚗
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
}