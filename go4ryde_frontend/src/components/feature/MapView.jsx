import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon issues
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Premium Custom Icons
const driverIcon = L.divIcon({
  className: "custom-div-icon",
  html: `<div style="width:40px;height:40px;background:#0f172a;border:3px solid #10b981;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 0 20px rgba(16,185,129,0.5);animation:pulsate 2s infinite">🚗</div><style>@keyframes pulsate{0%{box-shadow:0 0 5px rgba(16,185,129,0.4)}50%{box-shadow:0 0 25px rgba(16,185,129,0.8)}100%{box-shadow:0 0 5px rgba(16,185,129,0.4)}}</style>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const sourceIcon = L.divIcon({
  className: "custom-div-icon",
  html: `<div style="width:32px;height:32px;background:#10b981;border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 10px rgba(0,0,0,0.3)">🟢</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const destinationIcon = L.divIcon({
  className: "custom-div-icon",
  html: `<div style="width:32px;height:32px;background:#ef4444;border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 10px rgba(0,0,0,0.3)">🔴</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function RecenterMap({ coords, currentLocation }) {
  const map = useMap();
  useEffect(() => {
    if (currentLocation) {
       map.setView([currentLocation.lat, currentLocation.lng], 15);
       return;
    }
    if (coords && coords.length > 0) {
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [coords, currentLocation, map]);
  return null;
}

export default function MapView({ 
  source, 
  destination, 
  currentLocation,
  polyline, 
  className = "h-[400px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl" 
}) {
  const center = currentLocation ? [currentLocation.lat, currentLocation.lng] : (source ? [source.lat, source.lng] : [20.5937, 78.9629]);
  const zoom = currentLocation ? 15 : (source ? 13 : 5);

  const points = [];
  if (source) points.push([source.lat, source.lng]);
  if (destination) points.push([destination.lat, destination.lng]);
  if (currentLocation) points.push([currentLocation.lat, currentLocation.lng]);

  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {source && (
          <Marker position={[source.lat, source.lng]} icon={sourceIcon}>
            <Popup>
              <span className="font-bold uppercase text-[10px] tracking-widest text-primary">Origin</span>
              <p className="font-black text-slate-900">{source.name}</p>
            </Popup>
          </Marker>
        )}

        {destination && (
          <Marker position={[destination.lat, destination.lng]} icon={destinationIcon}>
            <Popup>
              <span className="font-bold uppercase text-[10px] tracking-widest text-red-500">Destination</span>
              <p className="font-black text-slate-900">{destination.name}</p>
            </Popup>
          </Marker>
        )}

        {currentLocation && (
          <Marker position={[currentLocation.lat, currentLocation.lng]} icon={driverIcon}>
            <Popup>
              <p className="font-black text-slate-900">Live Asset Location</p>
            </Popup>
          </Marker>
        )}

        {polyline && polyline.length > 1 && (
          <Polyline 
            positions={polyline} 
            color="#10b981" 
            weight={5} 
            opacity={0.6} 
            lineCap="round"
          />
        )}

        <RecenterMap coords={points} currentLocation={currentLocation} />
      </MapContainer>
    </div>
  );
}
