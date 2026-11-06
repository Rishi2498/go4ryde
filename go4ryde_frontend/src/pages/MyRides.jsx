import React, { useEffect, useState } from "react";
import { getMyRides } from "../api/rideService";
import { useNavigate } from "react-router-dom";
import "../css/pages/MyRides.css";

export default function MyRides() {
    const [rides, setRides] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRides();
    }, []);

    const fetchRides = async () => {
        const res = await getMyRides();
        setRides(res.data || []);
    };

    return (
        <div className="myrides-wrapper">

            <div className="myrides-container">

                <h2 className="title">🚗 My Rides</h2>

                <div className="ride-list">

                    {rides.length === 0 ? (
                        <p className="empty">No rides created yet</p>
                    ) : (
                        rides.map((ride) => (

                            <div key={ride.id} className="ride-card glass">

                                <div className="ride-left">

                                    {/* ROUTE */}
                                    <div className="route">
                                        <span className="from">{ride.source}</span>
                                        <span className="arrow">→</span>
                                        <span className="to">{ride.destination}</span>
                                    </div>

                                    {/* META */}
                                    <div className="meta">
                                        🕒 {new Date(ride.date_time).toLocaleString()}
                                    </div>

                                    {/* STATUS */}
                                    <span className={`status ${ride.status.toLowerCase()}`}>
                                        {ride.status}
                                    </span>

                                </div>

                                <button
                                    className="btn-outline"
                                    onClick={() =>
                                        navigate(`/ride/${ride.id}`, { state: ride })
                                    }
                                >
                                    View Details
                                </button>

                            </div>

                        ))
                    )}

                </div>

            </div>

        </div>
    );
}