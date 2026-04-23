import React, { useState } from "react";
import axios from "axios";
import RideSearchForm from "./RideSearchForm";

export default function RideSearchSection() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (formData) => {
        try {
            setLoading(true);

            const token = localStorage.getItem("access");

            const res = await axios.get(
                "http://localhost:8000/api/rides/",
                {
                    params: {
                        source: formData.from,
                        destination: formData.to,
                        date: formData.date,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setResults(res.data);

        } catch (err) {
            console.error("❌ Search error:", err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ marginTop: "20px" }}>

            {/* 🔍 SEARCH FORM */}
            <RideSearchForm onSearch={handleSearch} />

            {/* ⏳ LOADING */}
            {loading && <p>Searching rides...</p>}

            {/* 🚗 RESULTS */}
            <div style={{ marginTop: "20px" }}>
                {results.length === 0 && !loading && (
                    <p>No rides found</p>
                )}

                {results.map((ride) => (
                    <div key={ride.id} style={cardStyle}>
                        <h3>🚗 Ride #{ride.id}</h3>

                        <p>
                            📍 {ride.source} → {ride.destination}
                        </p>

                        <p>💰 ₹{ride.price_per_seat}</p>

                        <p>🪑 Seats: {ride.available_seats}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

const cardStyle = {
    padding: "15px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    marginBottom: "12px",
    background: "#fff",
};