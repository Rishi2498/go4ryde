import React, { useState } from "react";
import { sendOTP, register, login } from "../services/authService";
import { useNavigate } from "react-router-dom";
import "../css/pages/AuthPage.css";
import loginImage from "../images/login.jpeg";

export default function AuthPage() {

    const navigate = useNavigate();

    const [step, setStep] = useState("email");

    const [mode, setMode] = useState("login");

    const [email, setEmail] = useState("");

    const [phone, setPhone] = useState("");

    const [otp, setOtp] = useState("");

    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);

    // =====================================
    // ✅ VALIDATIONS
    // =====================================
    const validateEmail = () =>
        /\S+@\S+\.\S+/.test(email);

    const validatePhone = () =>
        /^[6-9]\d{9}$/.test(phone);

    // =====================================
    // 📩 SEND OTP
    // =====================================
    const handleSendOTP = async () => {

        setError("");

        // =====================================
        // ❌ EMAIL REQUIRED
        // =====================================
        if (!email) {

            return setError(
                "Email is required"
            );
        }

        // =====================================
        // ❌ INVALID EMAIL
        // =====================================
        if (!validateEmail()) {

            return setError(
                "Invalid email"
            );
        }

        // =====================================
        // REGISTER VALIDATION
        // =====================================
        if (mode === "register") {

            if (!phone) {

                return setError(
                    "Phone required"
                );
            }

            if (!validatePhone()) {

                return setError(
                    "Invalid phone"
                );
            }
        }

        try {

            setLoading(true);

            // ✅ SEND MODE
            await sendOTP(
                email,
                mode
            );

            // ✅ OPEN OTP STEP
            setStep("otp");

        } catch (err) {

            console.log(err);

            // =====================================
            // 🔄 SWITCH TO REGISTER
            // =====================================
            if (
                err.response?.data?.redirect ===
                "register"
            ) {

                setMode("register");

                setError(
                    "Account not found. Please register."
                );

                return;
            }

            // =====================================
            // 🔄 SWITCH TO LOGIN
            // =====================================
            if (
                err.response?.data?.redirect ===
                "login"
            ) {

                setMode("login");

                setError(
                    "Account already exists. Please login."
                );

                return;
            }

            // =====================================
            // ❌ NORMAL ERROR
            // =====================================
            setError(

                err.response?.data?.error ||

                "Failed to send OTP"
            );

        } finally {

            // ✅ ALWAYS RESET
            setLoading(false);
        }
    };
    // =====================================
    // 🔐 VERIFY OTP
    // =====================================
    const handleVerifyOTP = async () => {

        setError("");

        // ❌ OTP REQUIRED
        if (!otp) {

            return setError(
                "Enter OTP"
            );
        }

        try {

            setLoading(true);

            let res;

            // =====================================
            // REGISTER
            // =====================================
            if (mode === "register") {

                res = await register({

                    email,

                    phone,

                    otp
                });

            }

            // =====================================
            // LOGIN
            // =====================================
            else {

                res = await login({

                    email,

                    otp
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
                email
            );

            if (res.data.user) {

                localStorage.setItem(

                    "user",

                    JSON.stringify(
                        res.data.user
                    )
                );
            }

            // =====================================
            // NAVIGATION
            // =====================================
            if (
                res.data.role === "DRIVER"
            ) {

                navigate("/");

            } else {

                navigate("/profile");
            }

        } catch (err) {

            console.log(err);

            setError(

                err.response?.data?.error ||

                "Invalid OTP"
            );

        } finally {

            setLoading(false);
        }
    };

    // =====================================
    // 🔄 SWITCH MODE
    // =====================================
    const switchMode = (newMode) => {

        setMode(newMode);

        setError("");

        setPhone("");

        setOtp("");

        setStep("email");
    };

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

                        {/* <img
                            src={loginImage}
                            alt="ride"
                        /> */}

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

                    {/* SWITCH */}
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

                    {/* ERROR */}
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
                                    placeholder="Phone number"
                                    className="input"
                                    value={phone}
                                    onChange={(e) =>
                                        setPhone(
                                            e.target.value
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
                                placeholder="Enter OTP"
                                className="input otp"
                                value={otp}
                                maxLength={6}
                                onChange={(e) =>
                                    setOtp(
                                        e.target.value
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
                                    onClick={() =>
                                        setStep("email")
                                    }
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