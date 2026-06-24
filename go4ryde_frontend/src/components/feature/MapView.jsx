import React, { useEffect, useRef } from "react";
import { GoogleMap, Marker, Polyline } from "@react-google-maps/api";

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
  setSource,
  setDestination,
  height = "500px"
}) {
  const mapRef = useRef(null);

  const containerStyle = {
    width: "100%",
    height: height,
  };

  // 🚗 DRIVER FOLLOW MODE
  useEffect(() => {
    if (!mapRef.current || !currentLocation) return;

    mapRef.current.panTo(currentLocation);
    mapRef.current.setZoom(15);
  }, [currentLocation]);

  // 📍 ROUTE FIT
  useEffect(() => {
    if (!mapRef.current || currentLocation || !window.google) return;

    const bounds = new window.google.maps.LatLngBounds();

    if (source) bounds.extend(source);
    if (destination) bounds.extend(destination);

    if (!bounds.isEmpty()) {
      mapRef.current.fitBounds(bounds);
    }
  }, [source, destination, currentLocation]);

  return (
    <div style={{ width: "100%", height: height }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={
          currentLocation ||
          source ||
          { lat: 20.5937, lng: 78.9629 }
        }
        zoom={15}
        onLoad={(map) => (mapRef.current = map)}
        onClick={(e) => {
          if (!setSource || !setDestination) return;

          const lat = e.latLng.lat();
          const lng = e.latLng.lng();

          if (!source) {
            setSource({ lat, lng });
          } else {
            setDestination({ lat, lng });
          }
        }}
      >
        {source && <Marker position={source} icon={sourceIcon} />}
        {destination && <Marker position={destination} icon={destinationIcon} />}
        {currentLocation && <Marke position={currentLocation} icon={driverIcon} />}

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
    </div>
  );
}