import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MapView from "../components/MapView";
import api from "../utils/axiosInstance";

export default function RideTracking() {

    const { rideId } = useParams();
    const [driverLocation, setDriverLocation] = useState(null);

    useEffect(() => {

        const fetchLocation = async () => {
            try {
                console.log("🚀 Fetching location for ride:", rideId);

                // ✅ FIXED API PATH (IMPORTANT)
                const res = await api.get(`/tracking/driver-location/${rideId}/`);

                console.log("📍 LOCATION:", res.data);

                // ✅ ENSURE CORRECT FORMAT
                setDriverLocation({
                    lat: res.data.lat,
                    lng: res.data.lng
                });

            } catch (err) {
                console.error("❌ Error fetching location:", err);
            }
        };

        // 🔥 FIRST CALL (VERY IMPORTANT)
        fetchLocation();

        // 🔁 CONTINUOUS UPDATES
        const interval = setInterval(fetchLocation, 5000);

        return () => clearInterval(interval);

    }, [rideId]);

    return (
        <div style={{ padding: "20px" }}>
            <h2>🚗 Live Ride Tracking</h2>

            {/* 🔥 FORCE HEIGHT */}
            <div style={{ height: "500px", marginTop: "20px" }}>
                <MapView
                    currentLocation={
                        driverLocation || { lat: 17.385, lng: 78.486 }
                    }
                />
            </div>
        </div>
    );
}