import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../utils/axiosInstance";
import "../css/pages/RideDetails.css";



export default function RideDetails() {

    const location = useLocation();

    const [ride, setRide] = useState(
        location.state || null
    );

    const navigate = useNavigate();

    const [loadingId, setLoadingId] = useState(null);

    // =====================================
    // 📥 FETCH UPDATED RIDE
    // =====================================
    const fetchRideDetails = async () => {

        try {

            const res = await api.get(
                `/rides/${ride.id}/`
            );

            setRide(res.data);

        } catch (err) {

            console.log(err);
        }
    };

useEffect(() => {

if (
    ride?.status !== "ACTIVE" &&
    ride?.status !== "STARTED"
) return;
    let watchId;
watchId = navigator.geolocation.watchPosition(

    async (position) => {

        console.log(
            "📍 GPS RECEIVED:",
            position.coords.latitude,
            position.coords.longitude
        );

        try {

            console.log(
                "📡 Sending Tracking Update",
                ride.id
            );

            const res = await api.post(
                "/tracking/update-location/",
                {
                    ride_id: ride.id,
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                }
            );

            console.log(
                "✅ Tracking Saved:",
                res.data
            );

        } catch (err) {

            console.log(
                "❌ Tracking Error:",
                err.response?.data
            );

        }

    },

        (err) => {
            console.log(err);
        },

        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000,
        }

    );

    return () => {

        if (watchId) {
            navigator.geolocation.clearWatch(
                watchId
            );
        }

    };

}, [ride?.status, ride?.id]);

    // =====================================
    // 🚀 INITIAL LOAD
    // =====================================
    useEffect(() => {

        if (ride?.id) {

            fetchRideDetails();
        }

    }, []);

    if (!ride) return <p>No data</p>;

    // =====================================
    // ✅ ACCEPT BOOKING
    // =====================================
    const handleAccept = async (bookingId) => {

        try {

            setLoadingId(bookingId);

            await api.post(
                `/bookings/accept/${bookingId}/`
            );

            alert("Booking accepted ✅");

            await fetchRideDetails();

        } catch (err) {

            alert(
                err.response?.data?.error ||
                "Error"
            );

        } finally {

            setLoadingId(null);
        }
    };

    // =====================================
    // 🚗 START RIDE
    // =====================================
    const handleStart = async (bookingId) => {

        try {

            setLoadingId(bookingId);

            await api.post(
                `/bookings/start/${bookingId}/`
            );

            alert("Ride started 🚗");

            await fetchRideDetails();

        } catch (err) {

            alert(
                err.response?.data?.error ||
                "Error"
            );

        } finally {

            setLoadingId(null);
        }
    };

    // =====================================
    // 🏁 END RIDE
    // =====================================
    const handleEndRide = async (bookingId) => {

        try {

            setLoadingId(bookingId);

            await api.post(
                `/bookings/end-ride/${bookingId}/`
            );

            alert("Ride completed ✅");

            await fetchRideDetails();

        } catch (err) {

            alert(
                err.response?.data?.error ||
                "Error"
            );

        } finally {

            setLoadingId(null);
        }
    };

    // =====================================
    // 💬 OPEN CHAT
    // =====================================
    const openChat = (bookingId) => {

        navigate(`/chat/${bookingId}`);
    };

    return (

        <div className="details-page">

            <div className="container">

                {/* BACK */}
                <button
                    className="back"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>

                <div className="details-card">

                    {/* HEADER */}
                    <div className="ride-header">

                        <div>

                            <h2 className="route-title">
                                {ride.source} → {ride.destination}
                            </h2>

                            <p className="ride-subtitle">
                                Manage passengers and trip activity
                            </p>

                        </div>

                        <span
                            className={`status-badge ${ride.status?.toLowerCase()}`}
                        >
                            {ride.status}
                        </span>

                    </div>

                    {/* INFO */}
                    <div className="details-grid">

                        <div className="info-card">
                            <span>📅 Date: </span>

                            <strong>
                                {new Date(
                                    ride.date_time
                                ).toLocaleString()}
                            </strong>
                        </div>

                        <div className="info-card">
                            <span>💰 Price: </span>

                            <strong>
                                ₹{ride.price_per_seat}
                            </strong>
                        </div>

                        <div className="info-card">
                            <span>🪑 Seats Left/ Totla seats: </span>
                            

                            <strong>
                                {ride.seats_remaining}/{ride.seats_available}
                            </strong>
                        </div>



                        <div className="info-card">
                            <span>🚦 Status: </span>

                            <strong>
                                {ride.status}
                            </strong>
                        </div>

                    </div>

                    {/* BOOKINGS */}
                    <div className="booking-section">

                        <div className="section-header">

                            <h4 className="section-title">
                                Passenger Bookings
                            </h4>

                            <span className="booking-count">
                                {ride.bookings?.length || 0} bookings
                            </span>

                        </div>

                        {ride.bookings?.length === 0 ? (

                            <div className="empty-bookings">

                                <h4>
                                    No bookings yet
                                </h4>

                                <p>
                                    Passenger bookings will appear here.
                                </p>

                            </div>

                        ) : (

ride.bookings?.map((b) => (
                                <div
                                    key={b.id}
                                    className="booking-card"
                                >

                                    {/* LEFT */}
                                    <div className="booking-left">

                                        <div className="avatar">

                                            {
                                                b.user_email?.[0]?.toUpperCase()
                                            }

                                        </div>

                                     <div>

    <div className="passenger-info">

        <h4>Passenger</h4>

        {ride.status === "COMPLETED" ? (

            <div className="contact-hidden">
                🔒 Passenger contact hidden
            </div>

        ) : b.phone ? (

            <>
                {/* <div className="phone-number">
                    📞 {b.phone}
                </div> */}

                <a
                    href={`tel:${b.phone}`}
                    // className="btn-outline"
                    style={{ textDecoration: "none" }}
                >
                    📞 Call Passenger
                </a>
            </>

        ) : (

            <div className="contact-hidden">
                📵 Phone number unavailable
            </div>

        )}

    </div>
                                            <div className="booking-meta">

                                                <span
                                                    className={`small ${b.status?.toLowerCase()}`}
                                                >
                                                    {b.status}
                                                </span>

                                                <span
                                                    className={`small payment ${b.payment_status?.toLowerCase()}`}
                                                >
                                                    {b.payment_status}
                                                </span>

                                            </div>

                                        </div>

                                    </div>

                                    {/* ACTIONS */}
                                    <div className="actions">

                                        {/* ACCEPT */}
                                        {b.status === "PENDING" && (

                                            <button
                                                className="btn primary"
                                                onClick={() =>
                                                    handleAccept(b.id)
                                                }
                                                disabled={
                                                    loadingId === b.id
                                                }
                                            >
                                                {
                                                    loadingId === b.id
                                                        ? "..."
                                                        : "Accept"
                                                }
                                            </button>
                                        )}

                                        {/* START */}
                                        {b.status === "CONFIRMED" && (

                                            <button
                                                className="btn success"
                                                onClick={() =>
                                                    handleStart(b.id)
                                                }
                                                disabled={
                                                    loadingId === b.id
                                                }
                                            >
                                                {
                                                    loadingId === b.id
                                                        ? "..."
                                                        : "Start Ride"
                                                }
                                            </button>
                                        )}

                                        {/* END */}
                                        {b.status === "STARTED" && (

                                            <button
                                                className="btn danger"
                                                onClick={() =>
                                                    handleEndRide(b.id)
                                                }
                                                disabled={
                                                    loadingId === b.id
                                                }
                                            >
                                                {
                                                    loadingId === b.id
                                                        ? "..."
                                                        : "End Ride"
                                                }
                                            </button>
                                        )}

                                        {/* CHAT */}
                                        {(b.status === "CONFIRMED" ||
                                            b.status === "STARTED") && (

                                                <button
                                                    className="btn chat"
                                                    onClick={() =>
                                                        openChat(b.id)
                                                    }
                                                >
                                                    Chat
                                                </button>
                                            )}



{/* TRACKING */}
{/* TRACKING */}
{(b.status === "CONFIRMED" ||
    b.status === "STARTED") && (

    <button
        className="btn tracking"
        onClick={() =>
            navigate(`/tracking/${ride.id}`)
        }
    >
        📍 Track Ride
    </button>

)}

{/* COMPLETED */}
{b.status === "COMPLETED" && (

    <div>

        <div className="completed-pill">
            ✅ Completed
        </div>

        <div className="contact-hidden">
            🔒 Passenger contact hidden
        </div>

    </div>

)}
                                    </div>

                                </div>
                            ))
                        )}

                    </div>

                </div>

            </div>

        </div>
    );
}