import React, { useRef, useEffect } from "react";
import { Autocomplete } from "@react-google-maps/api";

export default function LocationInput({ placeholder, value, onSelect }) {
    const autoRef = useRef(null);
    const inputRef = useRef(null);

    // 🔥 CLEAR INPUT WHEN RESET
    useEffect(() => {
        if (!value && inputRef.current) {
            inputRef.current.value = "";
        }
    }, [value]);

    if (!window.google) {
        return <input placeholder="Loading map..." disabled />;
    }

    const handlePlaceChanged = () => {
        const place = autoRef.current.getPlace();

        if (!place || !place.geometry) return;

        const location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            name: place.formatted_address,
        };

        onSelect(location);

        // ✅ update visible text
        if (inputRef.current) {
            inputRef.current.value = location.name;
        }
    };

    return (
        <Autocomplete
            onLoad={(ref) => (autoRef.current = ref)}
            onPlaceChanged={handlePlaceChanged}
        >
            <input
                ref={inputRef}
                placeholder={placeholder}
                className="search-input"
            />
        </Autocomplete>
    );
}