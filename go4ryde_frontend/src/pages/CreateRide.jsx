import React, { useState } from "react";
import { createRide } from "../api/rideService";
import { useNavigate } from "react-router-dom";
import LocationSearch from "../components/LocationSearch";
import Toast from "../components/Toast";
import "../css/pages/CreateRide.css";


export default function CreateRide() {

    const navigate = useNavigate();

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
    const [toast, setToast] = useState(null);

    // ✅ FIX LOCAL TIME
    const getLocalDateTime = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        return new Date(now - offset).toISOString().slice(0, 16);
    };

    const handleSubmit = async () => {

        if (loading) return;

        if (!ride.source_lat || !ride.destination_lat) {
            return setToast({ message: "Select valid locations", type: "error" });
        }

        if (!ride.date_time) {
            return setToast({ message: "Select date & time", type: "error" });
        }

        if (!ride.seats_available) {
            return setToast({ message: "Select seats", type: "error" });
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

            await createRide(payload);

            setToast({ message: "Ride Created 🚀", type: "success" });

            // RESET FORM
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

            // REDIRECT
            setTimeout(() => {
                navigate("/my-rides", {
                    state: { refresh: true }
                });
            }, 800);

        } catch (err) {
            setToast({
                message: err.response?.data?.detail || "Error creating ride",
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
       
        
        <div className="create-wrapper">

            <div className="create-container">

                <div className="create-card glass">

                    <h2 className="create-title">🚗 Offer a Ride</h2>

                    {/* FROM */}
                    <div className="form-group">
                        <label>From</label>
                        <div className="input-box">
                            📍
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
                        </div>
                    </div>

                    {/* TO */}
                    <div className="form-group">
                        <label>To</label>
                        <div className="input-box">
                            📍
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
                        </div>
                    </div>

                    {/* DATE */}
                    <div className="form-group">
                        <label>Date & Time</label>
                        <input
                            type="datetime-local"
                            value={ride.date_time}
                            min={getLocalDateTime()}
                            onChange={(e) =>
                                setRide(prev => ({ ...prev, date_time: e.target.value }))
                            }
                        />
                    </div>

                    {/* ROW */}
                    <div className="form-row">

                        <div className="form-group">
                            <label>Price</label>
                            <input
                                type="number"
                                placeholder="₹ per seat"
                                value={ride.price_per_seat}
                                onChange={(e) =>
                                    setRide(prev => ({ ...prev, price_per_seat: e.target.value }))
                                }
                            />
                        </div>

                        <div className="form-group">
                            <label>Seats</label>
                            <select
                                value={ride.seats_available}
                                onChange={(e) =>
                                    setRide(prev => ({ ...prev, seats_available: e.target.value }))
                                }
                            >
                                <option value="">Seats</option>
                                {[1, 2, 3, 4, 5, 6].map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                    </div>

                    {/* BUTTON */}
                    <button
                        className="create-btn"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "🚀 Publish Ride"}
                    </button>

                </div>

            </div>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

        </div>
    );
}