import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MapView from "../components/MapView";

export default function RideTracking() {

    const { rideId } = useParams();
    const [driverLocation, setDriverLocation] = useState(null);

    useEffect(() => {

        const socket = new WebSocket(
            `ws://127.0.0.1:8000/ws/tracking/${rideId}/`
        );

        socket.onopen = () => {
            console.log("✅ Connected to tracking");
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            console.log("📍 Received:", data);

            setDriverLocation({
                lat: data.lat,
                lng: data.lng
            });
        };

        socket.onerror = (err) => {
            console.error("❌ WebSocket error:", err);
        };

        socket.onclose = () => {
            console.log("🔌 Disconnected");
        };

        return () => socket.close();

    }, [rideId]);

    return (
        <div style={{ padding: "20px" }}>
            <h2>🚗 Live Tracking</h2>
            <MapView
                currentLocation={
                    driverLocation || { lat: 17.385, lng: 78.486 }
                }
            />
        </div>
    );
}