import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MapView from "../components/feature/MapView";
import polyline from "@mapbox/polyline";

export default function RideRoutePage() {
    const navigate = useNavigate();
    const { state: ride } = useLocation();

    if (!ride) return <p>No route data</p>;

    const decoded = ride.route_geometry
        ? polyline.decode(ride.route_geometry).map(p => ({
            lat: p[0],
            lng: p[1]
        }))
        : [];

    return (
        <div style={{ padding: "20px" }}>
            <h2>🗺 Ride Route</h2>

            <MapView
                source={{ lat: ride.source_lat, lng: ride.source_lng }}
                destination={{ lat: ride.destination_lat, lng: ride.destination_lng }}
                polyline={decoded}
            />

            <button
                onClick={() => navigate(`/ride/${ride.id}/tracking`)}
            >
                🚗 Track Ride
            </button>
        </div>
    );
}