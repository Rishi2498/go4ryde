import React, { useRef } from "react";
import {  Autocomplete } from "@react-google-maps/api";


export default function LocationSearch({ onSelect }) {
    const autocompleteRef = useRef(null);

    const handlePlaceChanged = () => {
        const place = autocompleteRef.current.getPlace();

        if (!place.geometry) return;

        const location = place.geometry.location;

        onSelect({
            name: place.name,
            full: place.formatted_address,
            lat: location.lat(),
            lng: location.lng()
        });
    };

    return (
        // <LoadScript
        //     googleMapsApiKey="AIzaSyB4pCEdwk8UuHDtT9gtzmi9UBlCZxLYI1k"
        //     libraries={libraries}
        // >
        <Autocomplete
            onLoad={(ref) => (autocompleteRef.current = ref)}
            onPlaceChanged={handlePlaceChanged}
        >
            <input
                type="text"
                placeholder="Enter location"
                style={{ width: "100%", padding: "8px" }}
            />
        </Autocomplete>
        // </LoadScript >
    );
}