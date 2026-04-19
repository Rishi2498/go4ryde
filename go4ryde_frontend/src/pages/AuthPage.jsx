import React, { useState } from "react";
import { sendOTP, register, login } from "../services/authService";
import { useNavigate } from "react-router-dom";
import "./AuthPage.css";

export default function AuthPage() {
    const navigate = useNavigate();

    const [step, setStep] = useState("email"); // email | otp
    const [mode, setMode] = useState("login"); // login | register

    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // ---------------- VALIDATION ----------------
    const validateEmail = () => /\S+@\S+\.\S+/.test(email);
    const validatePhone = () => /^[6-9]\d{9}$/.test(phone);

    // ---------------- SEND OTP ----------------
    const handleSendOTP = async () => {
        setError("");

        if (!email) return setError("Email is required");
        if (!validateEmail()) return setError("Invalid email format");

        if (mode === "register") {
            if (!phone) return setError("Phone is required");
            if (!validatePhone()) return setError("Invalid phone number");
        }

        try {
            setLoading(true);

            await sendOTP(email); // ✅ backend only needs email

            setStep("otp");

        } catch (err) {
            setError(err.response?.data?.error || "Failed to send OTP");
        }

        setLoading(false);
    };

    // ---------------- VERIFY ----------------
    const handleVerifyOTP = async () => {
        setError("");

        if (!otp) return setError("Enter OTP");
        if (otp.length !== 6) return setError("OTP must be 6 digits");

        try {
            setLoading(true);

            let res;

            if (mode === "register") {
                res = await register({ email, phone, otp });
            } else {
                res = await login({ email, otp });
            }

            // ✅ STORE TOKENS
            localStorage.setItem("access", res.data.access);
            localStorage.setItem("refresh", res.data.refresh);
            localStorage.setItem("role", res.data.role);
            localStorage.setItem("email", email);  // ✅ ADD THIS
            // ✅ REDIRECT
            if (res.data.role === "DRIVER") {
                navigate("/dashboard");
            } else {
                navigate("/profile");
            }

        } catch (err) {
            setError(
                err.response?.data?.error ||
                JSON.stringify(err.response?.data) ||
                "Invalid OTP"
            );
        }

        setLoading(false);
    };

    // ---------------- SWITCH MODE ----------------
    const switchMode = (newMode) => {
        setMode(newMode);
        setError("");
        setPhone("");
        setOtp("");
        setStep("email");
    };

    return (
        <div className="auth-container">
            <div className="auth-card">

                <h2 className="title">GO4RYDE</h2>
                <p className="subtitle">
                    {mode === "login" ? "Login with OTP" : "Create your account"}
                </p>

                {/* 🔥 MODE SWITCH */}
                <div className="auth-switch">
                    <button
                        className={mode === "login" ? "active" : ""}
                        onClick={() => switchMode("login")}
                    >
                        Login
                    </button>
                    <button
                        className={mode === "register" ? "active" : ""}
                        onClick={() => switchMode("register")}
                    >
                        Register
                    </button>
                </div>

                {error && <div className="error">{error}</div>}

                {/* STEP 1 */}
                {step === "email" && (
                    <>
                        <input
                            type="email"
                            placeholder="Enter Email"
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        {mode === "register" && (
                            <input
                                type="text"
                                placeholder="Phone Number"
                                className="input"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        )}

                        <button
                            onClick={handleSendOTP}
                            className="btn"
                            disabled={loading}
                        >
                            {loading ? "Sending OTP..." : "Send OTP"}
                        </button>
                    </>
                )}

                {/* STEP 2 */}
                {step === "otp" && (
                    <>
                        <input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            className="input otp"
                            value={otp}
                            maxLength={6}
                            onChange={(e) => setOtp(e.target.value)}
                        />

                        <button
                            onClick={handleVerifyOTP}
                            className="btn success"
                            disabled={loading}
                        >
                            {loading ? "Verifying..." : "Verify & Continue"}
                        </button>

                        {/* 🔁 RESEND / BACK */}
                        <div className="auth-footer">
                            <button onClick={() => setStep("email")}>
                                Change Email
                            </button>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}