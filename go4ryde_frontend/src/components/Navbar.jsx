import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const [user, setUser] = useState(null);

    // ---------------- LOAD USER ----------------
    useEffect(() => {
        const token = localStorage.getItem("access");
        const email = localStorage.getItem("email");
        const role = localStorage.getItem("role"); // DRIVER / PASSENGER

        if (token) {
            setUser({
                email: email || "User",
                role: role || "PASSENGER"
            });
        }
    }, []);

    // ---------------- LOGOUT ----------------
    const handleLogout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("email");
        localStorage.removeItem("role");

        setUser(null);
        navigate("/auth");
    };

    // ---------------- ACTIVE LINK STYLE ----------------
    const isActive = (path) => location.pathname === path ? "active" : "";

    return (
        <div className="navbar">

            {/* LEFT */}
            <div className="nav-left">
                <h2 className="logo" onClick={() => navigate("/")}>
                    GO4RYDE
                </h2>
            </div>

            {/* CENTER (ONLY LOGGED IN USERS) */}
            {user && (
                <div className="nav-center">

                    <button
                        className={isActive("/rides")}
                        onClick={() => navigate("/rides")}
                    >
                        Find Rides
                    </button>

                    {/* DRIVER ONLY */}
                    {user.role === "DRIVER" && (
                        <button
                            className={isActive("/create-ride")}
                            onClick={() => navigate("/create-ride")}
                        >
                            Offer Ride
                        </button>
                    )}

                    <button
                        className={isActive("/my-rides")}
                        onClick={() => navigate("/my-rides")}
                    >
                        My Rides
                    </button>
                    <button onClick={() => navigate("/my-bookings")}>
                        My Bookings
                    </button>
                    <button
                        className={isActive("/profile")}
                        onClick={() => navigate("/profile")}
                    >
                        Profile
                    </button>
                </div>
            )}

            {/* RIGHT */}
            <div className="nav-right">

                {user ? (
                    <>
                        <div className="user-box">
                            <span className="user-email">{user.email}</span>
                            <span className="user-role">{user.role}</span>
                        </div>

                        <button className="logout-btn" onClick={handleLogout}>
                            Logout
                        </button>
                    </>
                ) : (
                    <button
                        className="login-btn"
                        onClick={() => navigate("/auth")}
                    >
                        Login
                    </button>
                )}

            </div>

        </div>
    );
}