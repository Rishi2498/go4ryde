import React from "react";
import Navbar from "../components/Navbar";

export default function Dashboard() {
    return (
        <div className="dashboard">

            {/* NAVBAR */}
            <Navbar />

            {/* MAIN CONTENT */}
            <div className="dashboard-content">

                <h1>Welcome to GO4RYDE 🚀</h1>
                <p>Your ride system is ready.</p>

            </div>

        </div>
    );
}