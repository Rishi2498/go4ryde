import React, { useRef } from "react";
import { Autocomplete } from "@react-google-maps/api";

export default function LocationInput({ placeholder, onSelect }) {
    const autoRef = useRef(null);

    // 🚨 SAFETY CHECK
    if (!window.google) {
        return <input placeholder="Loading map..." disabled />;
    }

    const handlePlaceChanged = () => {
        const place = autoRef.current.getPlace();

        if (!place || !place.geometry) return;

        onSelect({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            name: place.formatted_address,
        });
    };

    return (
        <Autocomplete
            onLoad={(ref) => (autoRef.current = ref)}
            onPlaceChanged={handlePlaceChanged}
        >
            <input
                placeholder={placeholder}
                style={{
                    width: "100%",
                    padding: "10px",
                    marginBottom: "10px",
                }}
            />
        </Autocomplete>
    );
}