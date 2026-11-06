import React, { useState } from "react";
import { sendOTP, register, login } from "../services/authService";
import { useNavigate } from "react-router-dom";
import "../css/pages/AuthPage.css";

export default function AuthPage() {
    const navigate = useNavigate();

    const [step, setStep] = useState("email");
    const [mode, setMode] = useState("login");

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // =====================================
    // VALIDATIONS
    // =====================================

    const validateEmail = () =>
        /\S+@\S+\.\S+/.test(email);

    const validatePhone = () =>
        /^[6-9]\d{9}$/.test(phone);

    // =====================================
    // SEND OTP
    // =====================================

    const handleSendOTP = async () => {
        setError("");

        // Email required
        if (!email.trim()) {
            return setError("Email is required");
        }

        // Email validation
        if (!validateEmail()) {
            return setError("Invalid email");
        }

        // Register validation
        if (mode === "register") {
            if (!username.trim()) {
                return setError("Name is required");
            }

            if (!phone.trim()) {
                return setError("Phone required");
            }

            if (!validatePhone()) {
                return setError("Invalid phone");
            }
        }

        try {
            setLoading(true);

            await sendOTP(email, mode);

            setStep("otp");
        } catch (err) {
            console.log("SEND OTP ERROR:", err);

            // Switch to register
            if (
                err.response?.data?.redirect === "register"
            ) {
                setMode("register");

                setError(
                    "Account not found. Please register."
                );

                return;
            }

            // Switch to login
            if (
                err.response?.data?.redirect === "login"
            ) {
                setMode("login");

                setError(
                    "Account already exists. Please login."
                );

                return;
            }

            setError(
                err.response?.data?.error ||
                "Failed to send OTP"
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================
    // VERIFY OTP
    // =====================================

    const handleVerifyOTP = async () => {
        setError("");

        if (!otp.trim()) {
            return setError("Enter OTP");
        }

        if (otp.length !== 6) {
            return setError("OTP must be 6 digits");
        }

        try {
            setLoading(true);

            let res;

            // =====================================
            // REGISTER
            // =====================================

            if (mode === "register") {
                res = await register({
                    username: username.trim(),
                    email: email.trim(),
                    phone: phone.trim(),
                    otp: otp.trim(),
                });
            }

            // =====================================
            // LOGIN
            // =====================================

            else {
                res = await login({
                    email: email.trim(),
                    otp: otp.trim(),
                });
            }

            // =====================================
            // SAVE TOKENS
            // =====================================

            localStorage.setItem(
                "access_token",
                res.data.access
            );

            localStorage.setItem(
                "refresh_token",
                res.data.refresh
            );

            localStorage.setItem(
                "role",
                res.data.role
            );

            localStorage.setItem(
                "email",
                email.trim()
            );

            if (res.data.user) {
                localStorage.setItem(
                    "user",
                    JSON.stringify(res.data.user)
                );
            }

            // =====================================
            // NAVIGATION
            // =====================================

            if (res.data.role === "DRIVER") {
                navigate("/");
            } else {
                navigate("/profile");
            }

        } catch (err) {
            console.log("REGISTER / LOGIN ERROR:", err);

            console.log(
                "SERVER RESPONSE:",
                err.response?.data
            );

            // Try to display backend error
            const serverError =
                err.response?.data?.error;

            if (serverError) {
                setError(serverError);
            } else if (err.response?.data) {
                // Handle Django validation errors
                const data = err.response.data;

                if (typeof data === "object") {
                    const firstError = Object.values(data)[0];

                    if (Array.isArray(firstError)) {
                        setError(String(firstError[0]));
                    } else if (firstError) {
                        setError(String(firstError));
                    } else {
                        setError("Registration failed");
                    }
                } else {
                    setError("Registration failed");
                }
            } else {
                setError("Invalid OTP");
            }

        } finally {
            setLoading(false);
        }
    };

    // =====================================
    // SWITCH LOGIN / REGISTER
    // =====================================

    const switchMode = (newMode) => {
        setMode(newMode);

        setError("");

        setUsername("");
        setPhone("");
        setOtp("");

        setStep("email");
    };

    // =====================================
    // RENDER
    // =====================================

    return (
        <div className="auth-wrapper">

            {/* =====================================
                LEFT SIDE
            ===================================== */}

            <div className="auth-left">

                <div className="auth-left-overlay">

                    <h1>
                        GO4RYDE
                    </h1>

                    <p>
                        Premium ridesharing experience
                        with secure bookings,
                        real-time chat,
                        smart matching
                        and seamless travel.
                    </p>

                    <div className="auth-features">

                        <span>
                            ⚡ Instant Booking
                        </span>

                        <span>
                            🔒 Secure Payments
                        </span>

                        <span>
                            💬 Live Chat
                        </span>

                        <span>
                            📍 Live Tracking
                        </span>

                    </div>

                    <div className="illustration">
                        {/* Login image can be added here later */}
                    </div>

                </div>

            </div>

            {/* =====================================
                RIGHT SIDE
            ===================================== */}

            <div className="auth-container">

                <div className="auth-card">

                    <h2 className="title">

                        {
                            mode === "login"
                                ? "Welcome Back 👋"
                                : "Create Account 🚀"
                        }

                    </h2>

                    {/* =====================================
                        SWITCH LOGIN / REGISTER
                    ===================================== */}

                    <div className="auth-switch">

                        <button
                            className={
                                mode === "login"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                switchMode("login")
                            }
                        >
                            Login
                        </button>

                        <button
                            className={
                                mode === "register"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                switchMode("register")
                            }
                        >
                            Register
                        </button>

                    </div>

                    {/* =====================================
                        ERROR
                    ===================================== */}

                    {error && (
                        <div className="error">
                            {error}
                        </div>
                    )}

                    {/* =====================================
                        EMAIL STEP
                    ===================================== */}

                    {step === "email" && (
                        <>

                            {/* USERNAME - REGISTER ONLY */}

                            {mode === "register" && (
                                <input
                                    type="text"
                                    placeholder="Full name"
                                    className="input"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(
                                            e.target.value
                                        )
                                    }
                                />
                            )}

                            {/* EMAIL */}

                            <input
                                type="email"
                                placeholder="Email address"
                                className="input"
                                value={email}
                                onChange={(e) =>
                                    setEmail(
                                        e.target.value
                                    )
                                }
                            />

                            {/* PHONE */}

                            {mode === "register" && (
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={10}
                                    placeholder="Phone number"
                                    className="input"
                                    value={phone}
                                    onChange={(e) =>
                                        setPhone(
                                            e.target.value.replace(
                                                /\D/g,
                                                ""
                                            )
                                        )
                                    }
                                />
                            )}

                            {/* SEND OTP */}

                            <button
                                onClick={handleSendOTP}
                                className="btn"
                                disabled={loading}
                            >

                                {
                                    loading
                                        ? "Sending..."
                                        : "Send OTP"
                                }

                            </button>

                        </>
                    )}

                    {/* =====================================
                        OTP STEP
                    ===================================== */}

                    {step === "otp" && (
                        <>

                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="Enter OTP"
                                className="input otp"
                                value={otp}
                                maxLength={6}
                                onChange={(e) =>
                                    setOtp(
                                        e.target.value.replace(
                                            /\D/g,
                                            ""
                                        )
                                    )
                                }
                            />

                            <button
                                onClick={handleVerifyOTP}
                                className="btn success"
                                disabled={loading}
                            >

                                {
                                    loading
                                        ? "Verifying..."
                                        : "Verify OTP"
                                }

                            </button>

                            <div className="auth-footer">

                                <button
                                    onClick={() => {
                                        setOtp("");
                                        setError("");
                                        setStep("email");
                                    }}
                                >
                                    Change Email
                                </button>

                            </div>

                        </>
                    )}

                </div>

            </div>

        </div>
    );
}
