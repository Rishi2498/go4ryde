// src/components/RideSearchForm.jsx

import React from "react";
import LocationInput from "./LocationInput";

export default function RideSearchForm({
    setSource,
    setDestination,
}) {

    // 📍 CURRENT LOCATION
    const handleCurrentLocation = () => {
        navigator.geolocation.getCurrentPosition((pos) => {
            const location = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                name: "Current Location",
            };

            setSource(location);
        });
    };

    return (
        <div style={{
            padding: "15px",
            background: "#fff",
            borderRadius: "10px",
            marginBottom: "10px"
        }}>
            {/* FROM */}
            <LocationInput
                placeholder="From location"
                onSelect={setSource}
            />

            {/* CURRENT LOCATION BUTTON */}
            <button onClick={handleCurrentLocation}>
                📍 Use Current Location
            </button>

            {/* TO */}
            <LocationInput
                placeholder="To location"
                onSelect={setDestination}
            />
        </div>
    );
}