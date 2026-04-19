import React, { useEffect, useRef } from "react";
import { GoogleMap, Marker, Polyline, LoadScript } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "500px", // ✅ FIXED HEIGHT
};

// ICONS
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

  // 🚗 DRIVER FOLLOW MODE (UBER STYLE)
  useEffect(() => {
    if (!mapRef.current || !currentLocation) return;

    mapRef.current.panTo(currentLocation);
    mapRef.current.setZoom(15); // 🔥 STREET LEVEL

  }, [currentLocation]);

  // 📍 ROUTE VIEW (ONLY when driver not present)
  useEffect(() => {
    if (!mapRef.current || currentLocation) return;

    const bounds = new window.google.maps.LatLngBounds();

    if (source) bounds.extend(source);
    if (destination) bounds.extend(destination);

    if (!bounds.isEmpty()) {
      mapRef.current.fitBounds(bounds);
    }

  }, [source, destination, currentLocation]);

  return (
    <div style={{ width: "100%", height: "500px" }}>
      <LoadScript googleMapsApiKey="AIzaSyB4pCEdwk8UuHDtT9gtzmi9UBlCZxLYI1k">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={
            currentLocation ||
            source ||
            { lat: 20.5937, lng: 78.9629 }
          }
          zoom={15}
          onLoad={(map) => (mapRef.current = map)}
        >

          {/* SOURCE */}
          {source && (
            <Marker position={source} icon={sourceIcon} />
          )}

          {/* DESTINATION */}
          {destination && (
            <Marker position={destination} icon={destinationIcon} />
          )}

          {/* DRIVER */}
          {currentLocation && (
            <Marker position={currentLocation} icon={driverIcon} />
          )}

          {/* ROUTE */}
          {polyline && polyline.length > 1 && (
            <Polyline
              path={polyline}
              options={{
                strokeColor: "#10b981",
                strokeOpacity: 0.9,
                strokeWeight: 5,
              }}
            />
          )}

        </GoogleMap>
      </LoadScript>
    </div>
  );
}