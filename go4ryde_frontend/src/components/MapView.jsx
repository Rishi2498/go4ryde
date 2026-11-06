import React, { useEffect, useRef } from "react";
import {
    GoogleMap,
    Marker,
    Polyline,
} from "@react-google-maps/api";

import "../css/pages/MapView.css";

const sourceIcon = {
    url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
};

const destinationIcon = {
    url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
};

const driverIcon = {
    url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
};

export default function MapView({
    source,
    destination,
    currentLocation,
    polyline,
}) {

    const mapRef = useRef(null);

    // 🚗 DRIVER FOLLOW MODE
    useEffect(() => {

        if (!mapRef.current || !currentLocation) return;

        mapRef.current.panTo(currentLocation);

        mapRef.current.setZoom(15);

    }, [currentLocation]);

    // 📍 AUTO FIT ROUTE
    useEffect(() => {

        if (!mapRef.current || currentLocation) return;

        if (!window.google) return;

        const bounds =
            new window.google.maps.LatLngBounds();

        if (source) bounds.extend(source);

        if (destination)
            bounds.extend(destination);

        if (!bounds.isEmpty()) {
            mapRef.current.fitBounds(bounds);
        }

    }, [source, destination, currentLocation]);

    return (
        <div className="map-wrapper">

            <GoogleMap
                mapContainerClassName="google-map"

                center={
                    currentLocation ||
                    source || {
                        lat: 20.5937,
                        lng: 78.9629,
                    }
                }

                zoom={15}

                onLoad={(map) => {
                    mapRef.current = map;
                }}

                options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                    fullscreenControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                }}
            >

                {/* SOURCE */}
                {source && (
                    <Marker
                        position={source}
                        icon={sourceIcon}
                    />
                )}

                {/* DESTINATION */}
                {destination && (
                    <Marker
                        position={destination}
                        icon={destinationIcon}
                    />
                )}

                {/* DRIVER */}
                {currentLocation && (
                    <Marker
                        position={currentLocation}
                        icon={driverIcon}
                        title="Driver"
                    />
                )}

                {/* ROUTE */}
                {polyline &&
                    polyline.length > 1 && (
                        <Polyline
                            path={polyline}
                            options={{
                                strokeColor: "#2563eb",
                                strokeOpacity: 0.9,
                                strokeWeight: 5,
                            }}
                        />
                    )}

            </GoogleMap>

        </div>
    );
}








