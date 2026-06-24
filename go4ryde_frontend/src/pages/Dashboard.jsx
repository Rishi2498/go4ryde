import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axiosInstance";


import Navbar from "../components/Navbar";

import "../css/pages/Dashboard.css";
import "../css/base.css";

import heroImg from "../images/hero-illustration.jpeg";

export default function Dashboard() {

    const [source, setSource] = useState("");

    const [destination, setDestination] =
        useState("");

    const navigate = useNavigate();

    // =====================================
    // 🚗 LOADING SCREEN
    // =====================================
    // =====================================
    // 🚗 LOADER
    // =====================================
    // const [loading, setLoading] =
    //     useState(true);

    // useEffect(() => {

    //     const start = Date.now();

    //     const loadDashboard = async () => {

    //         try {

    //             await Promise.all([

    //                 api.get("/accounts/profile/"),

    //                 api.get("/rides/")

    //             ]);


    //         } catch (err) {

    //             console.log(err);

    //         } finally {

    //             // ✅ MINIMUM 2 SEC LOADER
    //             const elapsed =
    //                 Date.now() - start;

    //             const remaining =
    //                 2000 - elapsed;

    //             if (remaining > 0) {

    //                 setTimeout(() => {

    //                     setLoading(false);

    //                 }, remaining);

    //             } else {

    //                 setLoading(false);
    //             }
    //         }
    //     };

    //     loadDashboard();

    // }, []);

    // // =====================================
    // // 🔍 SEARCH
    // // =====================================
    const handleSearch = () => {

        if (!source || !destination) {

            alert("Select both locations");

            return;
        }

        navigate("/search");
    };

    // // =====================================
    // // 🚗 PREMIUM LOADER
    // // =====================================
    // if (loading) {

    //     return (

    //         <div className="map-loading">

    //             <div className="road">

    //                 <div className="lane"></div>

    //                 <div className="car">
    //                     🚗
    //                 </div>

    //             </div>

    //             <h3>
    //                 Loading GO4RYDE...
    //             </h3>

    //             <p>
    //                 Preparing your ride experience
    //             </p>

    //         </div>
    //     );
    // }

    // =====================================
    // ✅ PAGE
    // =====================================
    return (

        <div className="home">

            <Navbar />

            {/* BACKGROUND */}
            <div className="bg-pattern"></div>

            <main className="home-main">

                {/* =====================================
                    HERO
                ===================================== */}
                <section className="hero">

                    {/* LEFT */}
                    <div className="hero-left">

                        <div className="badge">
                            🚀 Over 10,000 rides shared this month
                        </div>

                        <h1 className="hero-title">

                            Your commute,
                            <br />

                            <span>
                                shared & smarter.
                            </span>

                        </h1>

                        <p className="hero-sub">

                            Join our community of
                            verified drivers and passengers.

                            Save money, reduce traffic,
                            and travel smarter.

                        </p>

                        <div className="hero-buttons">

                            <button
                                className="btn-primary"
                                onClick={() =>
                                    navigate("/rides")
                                }
                            >
                                🔍 Find a Ride
                            </button>

                            <button
                                className="btn-secondary"
                                onClick={() =>
                                    navigate("/create-ride")
                                }
                            >
                                ➕ Offer a Ride
                            </button>

                        </div>

                    </div>

                    {/* RIGHT */}
                    <div className="hero-right">

                        <div className="hero-glow"></div>

                        <img
                            src={heroImg}
                            alt="Car sharing journey"
                            className="hero-img float"
                        />

                        {/* CARD 1 */}
                        <div className="floating-card top-card">

                            <div className="icon green">
                                🛡
                            </div>

                            <div>

                                <p className="small">
                                    Verified
                                </p>

                                <p className="bold">
                                    Safe Drivers
                                </p>

                            </div>

                        </div>

                        {/* CARD 2 */}
                        <div className="floating-card bottom-card">

                            <div className="icon blue">
                                💳
                            </div>

                            <div>

                                <p className="small">
                                    Save up to
                                </p>

                                <p className="bold">
                                    50% on travel
                                </p>

                            </div>

                        </div>

                    </div>

                </section>

                {/* =====================================
                    SEARCH
                ===================================== */}
                <div className="search-card">

                    <input
                        placeholder="From location"
                        value={source}
                        onChange={(e) =>
                            setSource(e.target.value)
                        }
                    />

                    <input
                        placeholder="To location"
                        value={destination}
                        onChange={(e) =>
                            setDestination(e.target.value)
                        }
                    />

                    <button onClick={handleSearch}>
                        Find Rides
                    </button>

                </div>

                {/* =====================================
                    FEATURES
                ===================================== */}
                <section className="features-section">

                    <div className="features-container">

                        {/* HEADER */}
                        <div className="features-header">

                            <h2>
                                Why choose GO4RYDE?
                            </h2>

                            <p>

                                We're making intercity travel
                                simpler, more affordable,
                                and surprisingly enjoyable.

                            </p>

                        </div>

                        {/* GRID */}
                        <div className="features-grid">

                            {/* CARD 1 */}
                            <div className="feature-card glass">

                                <div className="feature-icon">
                                    📍
                                </div>

                                <h3>
                                    Your pick of rides
                                    at low prices
                                </h3>

                                <p>

                                    No matter where you're going,
                                    find the perfect ride from
                                    our wide selection of routes
                                    at low prices.

                                </p>

                            </div>

                            {/* CARD 2 */}
                            <div className="feature-card glass">

                                <div className="feature-icon">
                                    🛡
                                </div>

                                <h3>
                                    Trust who you travel with
                                </h3>

                                <p>

                                    We verify profiles, reviews,
                                    and IDs so you travel safely
                                    with trusted drivers.

                                </p>

                            </div>

                            {/* CARD 3 */}
                            <div className="feature-card glass">

                                <div className="feature-icon">
                                    ⭐
                                </div>

                                <h3>
                                    Scroll, click,
                                    tap and go!
                                </h3>

                                <p>

                                    Book rides instantly with
                                    a smooth experience powered
                                    by smart technology.

                                </p>

                            </div>

                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
}