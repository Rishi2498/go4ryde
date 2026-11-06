import React, {
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import api from "../utils/axiosInstance";

import "../css/pages/RideDetails.css";

export default function PassengerRideDetails() {

    const navigate = useNavigate();

    const { id } = useParams();

    const [booking, setBooking] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {

        loadBooking();

    }, [id]);

    const loadBooking = async () => {

        try {

            const response =
                await api.get(
                    `/bookings/${id}/`
                );

            setBooking(
                response.data
            );

        } catch (error) {

            console.error(
                "Booking Error:",
                error
            );

        } finally {

            setLoading(false);
        }
    };

    if (loading) {

        return (

            <div className="details-page">

                <div className="details-card">

                    <h2>
                        Loading...
                    </h2>

                </div>

            </div>

        );
    }

    if (!booking) {

        return (

            <div className="details-page">

                <div className="details-card">

                    <h2>
                        Booking not found
                    </h2>

                    <button
                        className="action-btn support"
                        onClick={() =>
                            navigate(
                                "/my-bookings"
                            )
                        }
                    >
                        Back to My Bookings
                    </button>

                </div>

            </div>

        );
    }

    return (

        <div className="details-page">

            <div className="container">

                <button
                    className="back"
                    onClick={() =>
                        navigate(-1)
                    }
                >
                    ← Back
                </button>

                <div className="details-card">

                    <div className="ride-header">

                        <div>

                            <h2 className="route-title">
                                {booking.ride}
                            </h2>

                            <p className="ride-subtitle">
                                Passenger Booking Details
                            </p>

                        </div>

                        <span
                            className={`status-badge ${
                                booking.ride_status?.toLowerCase()
                            }`}
                        >
                            {booking.ride_status}
                        </span>

                    </div>

                    <div className="details-grid">

                        <div className="info-card">

                            <span>
                                💰 Amount:
                            </span>

                            <strong>
                                ₹{booking.amount}
                            </strong>

                        </div>

                        <div className="info-card">

                            <span>
                                💳 Payment:
                            </span>

                            <strong>
                                {
                                    booking.payment_status
                                }
                            </strong>

                        </div>

                        <div className="info-card">

                            <span>
                                🎫 Booking:
                            </span>

                            <strong>
                                {booking.status}
                            </strong>

                        </div>

                        <div className="info-card">

                            <span>
                                🚦 Ride:
                            </span>

                            <strong>
                                {
                                    booking.ride_status
                                }
                            </strong>

                        </div>

                    </div>

                    <div className="booking-section">

                        <h3 className="section-title">
                            Driver Assistance
                        </h3>

                        <div className="driver-card">

                            <div className="driver-avatar">
                                🚗
                            </div>

                            <div className="driver-details">

                                <h4>
                                    Driver Connected
                                </h4>

                                {
                                    booking.ride_status !==
                                        "COMPLETED" &&
                                    booking.driver_phone ? (

                                        <p className="driver-phone">
                                            📞
                                            {
                                                booking.driver_phone
                                            }
                                        </p>

                                    ) : (

                                        <p className="contact-hidden">
                                            🔒 Driver
                                            contact hidden
                                            after ride
                                            completion
                                        </p>

                                    )
                                }

                            </div>

                        </div>

                    </div>

                    <div className="ride-actions">

                        {
                            booking.ride_status !==
                                "COMPLETED" &&
                            booking.driver_phone && (

                                <a
                                    href={`tel:${booking.driver_phone}`}
                                    className="action-button"
                                >
                                    📞 Call
                                </a>

                            )
                        }

                        {
                            booking.ride_status !==
                                "COMPLETED" && (

                                <button
                                    className="action-button"
                                    onClick={() =>
                                        navigate(
                                            `/chat/${booking.id}`
                                        )
                                    }
                                >
                                    💬 Chat
                                </button>

                            )
                        }

                        {
                            booking.ride_status &&
                            booking.ride_status !==
                                "COMPLETED" &&
                            booking.ride_status !==
                                "CANCELLED" && (

                                <button
                                    className="action-button primary"
                                    onClick={() =>
                                        navigate(
                                            `/tracking/${booking.ride_id}`
                                        )
                                    }
                                >
                                    📍 Live Tracking
                                </button>

                            )
                        }

                        <button
                            className="action-button"
                            onClick={() =>
                                alert(
                                    "Please contact Go4Ryde support for assistance."
                                )
                            }
                        >
                            🎧 Support
                        </button>

                    </div>

                </div>

            </div>

        </div>

    );
}