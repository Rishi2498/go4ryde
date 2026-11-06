import React from "react";
import LocationInput from "./LocationInput";
export default function RideSearchForm({
    source,
    destination,
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
        <div className="search-box">

            {/* FROM */}
            <LocationInput
                placeholder="From location"
                value={source}
                onSelect={setSource}
            />
            {/* 
            <button className="current-btn" onClick={handleCurrentLocation}>
                📍
            </button> */}
            {/* Use Current Location */}
            {/* TO */}
            <LocationInput
                placeholder="To location"
                value={destination}
                onSelect={setDestination}
            />

        </div>
    );
}