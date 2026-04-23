import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import RideSearchForm from "../components/RideSearchForm";
import MapView from "../components/MapView";

export default function Dashboard() {
    const [source, setSource] = useState(null);
    const [destination, setDestination] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [polyline, setPolyline] = useState(null);

    const navigate = useNavigate();

    // 🚀 HANDLE SEARCH CLICK
    const handleSearch = () => {
        if (!source || !destination) {
            alert("Please select both source and destination");
            return;
        }

        console.log("✅ Searching rides:", source, destination);

        // ✅ STORE FOR NEXT PAGE
        localStorage.setItem("ride_search", JSON.stringify({
            source,
            destination
        }));

        // 🚀 NAVIGATE
        navigate("/route-preview", {
            state: { source, destination }
        });
    };

    return (
        <div className="dashboard">
            <Navbar />

            <div className="dashboard-content">

                <h1>GO4RYDE 🚀</h1>

                {/* 🔍 SEARCH FORM */}
                <RideSearchForm
                    setSource={setSource}
                    setDestination={setDestination}
                />

                {/* 🔘 SEARCH BUTTON */}
                <button
                    onClick={handleSearch}
                    style={{
                        marginTop: "10px",
                        padding: "10px 15px",
                        background: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer"
                    }}
                >
                    🔍 Search Rides
                </button>

                {/* 🗺️ MAP */}
                <MapView
                    source={source}
                    destination={destination}
                    currentLocation={currentLocation}
                    polyline={polyline}
                    setSource={setSource}
                    setDestination={setDestination}
                />

            </div>
        </div>
    );
}