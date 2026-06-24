import React, { useEffect, useState } from "react";
import { getRides } from "../services/rideService";
import { createBooking } from "../api/bookingService";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import RideSearchForm from "../components/RideSearchForm";
import "../css/pages/SearchRides.css";


export default function SearchRides() {

    const [allRides, setAllRides] = useState([]);
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(false);
    const [seats, setSeats] = useState({});
    const [bookingLoading, setBookingLoading] = useState(null);
    const [toast, setToast] = useState(null);

    const [source, setSource] = useState(null);
    const [destination, setDestination] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        loadRides();
    }, []);

    const loadRides = async () => {
        try {
            setLoading(true);
            const res = await getRides();
            setAllRides(res.data || []);
            setRides(res.data || []);
        } catch (err) {
            setToast({ message: err.response?.data?.error || "NO Rides Available", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (!source || !destination) {
            return setToast({
                message: "Select source and destination",
                type: "error"
            });
        }

        const filtered = allRides.filter((r) =>
            r.source.toLowerCase().includes(source.name.toLowerCase()) &&
            r.destination.toLowerCase().includes(destination.name.toLowerCase())
        );

        setRides(filtered);
    };

    const handleReset = () => {
        setRides(allRides);
        setSource(null);
        setDestination(null);
        setSeats({});
    };

    const handleBooking = async (ride) => {
        const rideId = ride.id;
        const selectedSeats = seats[rideId] || 1;

        try {
            setBookingLoading(rideId);

            const res = await createBooking({
                ride: rideId,
                seats: selectedSeats
            });

            setToast({
                message: "Booking Created ✅",
                type: "success"
            });

            navigate(`/payment/${res.data.booking_id}`);

        } catch (err) {

    console.log(
        "BOOKING ERROR:",
        err.response?.data
    );

    alert(
        JSON.stringify(
            err.response?.data
        )
    );
   

} finally {
            setBookingLoading(null);
        }
    };

    return (
        <div className="search-page">

            {/* HERO */}
            <div className="search-hero">
                <div className="search-inner">

                    <h1 className="search-heading">
                        Where do you want to go?
                    </h1>

                    <div className="search-glass">

                        <div className="search-form">

                            <RideSearchForm
                                source={source}
                                destination={destination}
                                setSource={setSource}
                                setDestination={setDestination}
                            />

                            <button className="search-btn" onClick={handleSearch}>
                                🔍
                            </button>

                        </div>

                        <div className="search-actions">
                            <button className="reset-btn" onClick={handleReset}>
                                Reset
                            </button>
                        </div>

                    </div>

                </div>
            </div>

            {/* RESULTS */}
            <div className="search-container">

                <h2 className="ride-title">Available Rides</h2>

                {loading ? (
                    <p className="empty">Loading rides...</p>
                ) : rides.length === 0 ? (
                    <p className="empty">No rides found</p>
                ) : (
                    <div className="ride-list">

                        {rides.map((ride) => {

                            const remainingSeats = ride.seats_remaining ?? 0;

const isCompleted =
    ride.status?.toLowerCase() === "completed";

const isCancelled =
    ride.status?.toLowerCase() === "cancelled";

const isStarted =
    ride.status?.toLowerCase() === "started";

const isActive =
    ride.status?.toLowerCase() === "active";


const isFull = remainingSeats === 0;

const canBook =
    !isFull &&
    !isCompleted &&
    !isCancelled &&
    !isStarted&&
    !isActive;

                            return (
                                <div
                                    key={ride.id}
                                    className={`ride-card ${isFull ? "full" : ""}`}
                                >

                                    {/* LEFT */}
                                    <div className="ride-left">

                                        <div className="route">
                                            <span className="from">{ride.source}</span>
                                            <span className="arrow">→</span>
                                            <span className="to">{ride.destination}</span>
                                        </div>

                                        <div className="meta">
                                            💰 ₹{ride.price_per_seat} • 🪑 {remainingSeats} seats
                                        </div>

                                        <span className={`status ${ride.status.toLowerCase()}`}>
                                            {ride.status}
                                        </span>

                                    </div>

                                    {/* RIGHT */}
                                    <div className="ride-right">

                                        <button
    className="book-btn"
    disabled={!canBook || bookingLoading === ride.id}
    onClick={() => handleBooking(ride)}
>
    {bookingLoading === ride.id
        ? "Booking..."
        : isFull
        ? "Full"
        : isCompleted
        ? "Completed"
        : isCancelled
        ? "Cancelled"
        : isStarted
        ? "Started"
        : isActive
        ? "Active"
        : "Book"}
</button>

                                        <button
                                            className="btn-outline"
                                            onClick={() =>
                                                navigate(`/ride/${ride.id}/route`, { state: ride })
                                            }
                                        >
                                            View
                                        </button>

                                    </div>

                                </div>
                            );
                        })}

                    </div>
                )}

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