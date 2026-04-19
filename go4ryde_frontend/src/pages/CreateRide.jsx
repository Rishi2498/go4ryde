import React, { useState } from "react";
import { createRide } from "../api/rideService";
import LocationSearch from "../components/LocationSearch";

export default function CreateRide() {

    const [ride, setRide] = useState({
        source: "",
        source_lat: null,
        source_lng: null,

        destination: "",
        destination_lat: null,
        destination_lng: null,

        date_time: "",
        price_per_seat: "",
        seats_available: "",
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {

        if (loading) return;

        // 🔥 VALIDATION (IMPORTANT)
        if (!ride.source_lat || !ride.destination_lat) {
            return alert("Please select locations from suggestions");
        }

        if (!ride.date_time) {
            return alert("Select date & time");
        }

        if (!ride.seats_available) {
            return alert("Select seats");
        }

        try {
            setLoading(true);

            const payload = {
                source: ride.source,
                destination: ride.destination,

                source_lat: ride.source_lat,
                source_lng: ride.source_lng,

                destination_lat: ride.destination_lat,
                destination_lng: ride.destination_lng,

                date_time: new Date(ride.date_time).toISOString(),
                seats_available: Number(ride.seats_available),

                price_per_seat: ride.price_per_seat
                    ? Number(ride.price_per_seat)
                    : null
            };

            console.log("PAYLOAD:", payload);

            await createRide(payload);

            alert("Ride Created 🚀");

            // RESET
            setRide({
                source: "",
                source_lat: null,
                source_lng: null,
                destination: "",
                destination_lat: null,
                destination_lng: null,
                date_time: "",
                price_per_seat: "",
                seats_available: "",
            });

        } catch (err) {
            console.error(err.response?.data);
            alert(JSON.stringify(err.response?.data));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "auto" }}>
            <h2>Create Ride</h2>

            {/* SOURCE */}
            <label>Source</label>
            <LocationSearch
                onSelect={(place) =>
                    setRide(prev => ({
                        ...prev,
                        source: place.full,
                        source_lat: place.lat,
                        source_lng: place.lng
                    }))
                }
            />

            {/* DESTINATION */}
            <label>Destination</label>
            <LocationSearch
                onSelect={(place) =>
                    setRide(prev => ({
                        ...prev,
                        destination: place.full,
                        destination_lat: place.lat,
                        destination_lng: place.lng
                    }))
                }
            />

            {/* DATE */}
            <label>Date & Time</label>
            <input
                type="datetime-local"
                value={ride.date_time}
                onChange={(e) =>
                    setRide(prev => ({ ...prev, date_time: e.target.value }))
                }
            />

            {/* PRICE */}
            <label>Price (optional)</label>
            <input
                type="number"
                value={ride.price_per_seat}
                onChange={(e) =>
                    setRide(prev => ({ ...prev, price_per_seat: e.target.value }))
                }
            />

            {/* SEATS */}
            <label>Seats</label>
            <select
                value={ride.seats_available}
                onChange={(e) =>
                    setRide(prev => ({ ...prev, seats_available: e.target.value }))
                }
            >
                <option value="">Select Seats</option>
                {[1, 2, 3, 4, 5, 6].map(s => (
                    <option key={s} value={s}>{s}</option>
                ))}
            </select>

            <button
                onClick={handleSubmit}
                disabled={loading}
                style={{ marginTop: "10px", width: "100%" }}
            >
                {loading ? "Creating..." : "Create Ride"}
            </button>
        </div>
    );
}