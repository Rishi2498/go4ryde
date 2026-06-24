import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Car, Menu, X } from "lucide-react";
import NotificationBell from "./NotificationBell";
import "../css/pages/Navbar.css";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    // ✅ Check login + scroll
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);

        const checkAuth = () => {
            const token = localStorage.getItem("access_token");
            setIsLoggedIn(!!token);
        };

        checkAuth();

        // 🔥 listen for login/logout changes
        window.addEventListener("authChanged", checkAuth);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("authChanged", checkAuth);
        };
    }, [location]); // 👈 updates when route changes

    // ✅ Logout
    const handleLogout = () => {
        localStorage.clear();
        setIsLoggedIn(false);
        window.dispatchEvent(new Event("authChanged")); // 🔥 notify app
        navigate("/login");
    };

    const navLinks = [
        { name: "Home", path: "/" },
        { name: "Find a Ride", path: "/rides" },
        { name: "Offer a Ride", path: "/create-ride" },
    ];

    return (
        <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
            <div className="nav-container">

                {/* LOGO */}
                <Link to="/" className="logo">
                    <div className="logo-icon">
                        <Car size={20} />
                    </div>
                    <span className="logo-text">
                        GO4<span>RYDE</span>
                    </span>
                </Link>

                {/* NAV LINKS */}
                <nav className="nav-links">
                    {navLinks.map((l) => (
                        <Link
                            key={l.path}
                            to={l.path}
                            className={`nav-item ${location.pathname === l.path ? "active" : ""}`}
                        >
                            {l.name}
                        </Link>
                    ))}
                </nav>

                {/* RIGHT SIDE */}
                <div className="nav-right">

    {isLoggedIn && (
        <NotificationBell />
    )}

    {isLoggedIn ? (
        <>
            <Link
                to="/profile"
                className="signin-btn"
            >
                Profile
            </Link>

            <button
                className="logout-btn"
                onClick={handleLogout}
            >
                Logout
            </button>
        </>
    ) : (
        <Link
            to="/login"
            className="signin-btn"
        >
            Sign In
        </Link>
    )}

</div>

                {/* MOBILE ICON */}
                <div className="mobile-icon" onClick={() => setOpen(!open)}>
                    {open ? <X /> : <Menu />}
                </div>
            </div>

            {/* MOBILE MENU */}
            {open && (
                <div className="mobile-menu">
                    {navLinks.map((l) => (
                        <Link
                            key={l.path}
                            to={l.path}
                            onClick={() => setOpen(false)}
                        >
                            {l.name}
                        </Link>
                    ))}

                    {isLoggedIn ? (
                        <>
                            <Link to="/profile" onClick={() => setOpen(false)}>
                                Profile
                            </Link>
                            <button onClick={handleLogout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link to="/login" onClick={() => setOpen(false)}>
                            Sign In
                        </Link>
                    )}
                </div>
            )}
        </header>
    );
}