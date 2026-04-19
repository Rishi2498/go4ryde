import React, { useEffect, useState } from "react";
import { getRides } from "../api/rideService";
import MapView from "../components/MapView";
import BookRide from "./BookRide";
import { useNavigate } from "react-router-dom";
import polyline from "@mapbox/polyline";

export default function RideList() {

    const navigate = useNavigate();

    const [rides, setRides] = useState([]);
    const [filters, setFilters] = useState({
        source: "",
        destination: "",
    });

    const [selectedRoute, setSelectedRoute] = useState(null);
    const [loading, setLoading] = useState(false);

    // 🚀 Fetch rides
    const fetchRides = async (extraFilters = {}) => {
        try {
            setLoading(true);
            const res = await getRides({ ...filters, ...extraFilters });
            setRides(res.data);
        } catch (err) {
            console.error("Error fetching rides:", err);
        } finally {
            setLoading(false);
        }
    };

    // 📍 Nearby rides
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                fetchRides({
                    source_lat: pos.coords.latitude,
                    source_lng: pos.coords.longitude
                });
            },
            () => fetchRides()
        );
    }, []);

    // 🔥 HANDLE ROUTE VIEW
    const handleViewRoute = (ride) => {
        if (!ride.route_geometry) {
            alert("Route not available");
            return;
        }

        try {
            const decoded = polyline.decode(ride.route_geometry).map(p => ({
                lat: p[0],
                lng: p[1]
            }));

            setSelectedRoute({
                polyline: decoded,
                source: {
                    lat: ride.source_lat,
                    lng: ride.source_lng,
                    name: ride.source
                },
                destination: {
                    lat: ride.destination_lat,
                    lng: ride.destination_lng,
                    name: ride.destination
                }
            });

        } catch (err) {
            console.error("Polyline decode error:", err);
        }
    };

    return (
        <div style={{ maxWidth: "800px", margin: "auto" }}>
            <h2>Available Rides</h2>

            {/* 🔍 FILTERS */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <input
                    placeholder="Source"
                    onChange={(e) =>
                        setFilters({ ...filters, source: e.target.value })
                    }
                />

                <input
                    placeholder="Destination"
                    onChange={(e) =>
                        setFilters({ ...filters, destination: e.target.value })
                    }
                />

                <button onClick={() => fetchRides()}>
                    Search
                </button>
            </div>

            {/* 🚗 RIDES */}
            {loading && <p>Loading rides...</p>}

            {!loading && rides.length === 0 && (
                <p>No rides found</p>
            )}

            {rides.map((ride) => {
                const seatsLeft = ride.seats_remaining ?? 0;

                return (
                    <div
                        key={ride.id}
                        style={{
                            border: "1px solid #ccc",
                            margin: "10px 0",
                            padding: "15px",
                            borderRadius: "10px"
                        }}
                    >
                        <h3>{ride.source} → {ride.destination}</h3>

                        <p>📅 {new Date(ride.date_time).toLocaleString()}</p>
                        <p>💰 ₹{ride.price_per_seat}</p>
                        <p>📏 {ride.distance_km} km</p>
                        <p>🪑 Seats left: {seatsLeft}</p>

                        {/* 🔥 ROUTE BUTTON */}
                        <button
                            onClick={() => handleViewRoute(ride)}
                            style={{ marginRight: "10px" }}
                        >
                            View Route
                        </button>

                        {/* 🚀 BOOKING */}
                        {seatsLeft > 0 ? (
                            <BookRide ride={ride} />
                        ) : (
                            <p style={{ color: "red" }}>Ride Full</p>
                        )}

                        {/* 🔥 FUTURE: TRACK BUTTON (after booking) */}
                        {/* 
                        <button onClick={() => navigate(`/tracking/${ride.id}`)}>
                            Track Ride
                        </button> 
                        */}
                    </div>
                );
            })}

            {/* 🗺 MAP VIEW */}
            {selectedRoute && (
                <div style={{ marginTop: "20px" }}>
                    <MapView
                        source={selectedRoute.source}
                        destination={selectedRoute.destination}
                        polyline={selectedRoute.polyline}
                    />
                </div>
            )}
        </div>
    );
}