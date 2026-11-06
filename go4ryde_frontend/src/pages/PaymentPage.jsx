import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createPayment } from "../api/paymentService";
import { getMyBookings } from "../api/bookingService";
import api from "../utils/axiosInstance";
import "../css/pages/Payment.css";

export default function PaymentPage() {

    const { id: bookingId } = useParams();
    const navigate = useNavigate();

    const [booking, setBooking] = useState(null);
    const [ride, setRide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);

    const amount = Number(
    booking?.amount || 0
);

const remainingAmount = Number(
    booking?.remaining_amount || 0
);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await getMyBookings();

            const found = res.data.find(
                (b) => String(b.id) === String(bookingId)
            );

            if (!found) {
                alert("Booking not found");
                navigate("/my-bookings");
                return;
            }

            if (found.payment_status === "PAID") {
                navigate("/payment/success");
                return;
            }

            setBooking(found);

            const rideRes = await api.get(`/rides/${found.ride_id}/`);
            setRide(rideRes.data);

        } catch (err) {
            console.error(err);
            alert("Error loading data");
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // 💳 PAYMENT HANDLER
    // =========================
    const handlePayment = async (type) => {
        try {
            setPaying(true);

            const res = await createPayment({
                booking_id: booking.id,
                payment_type: type
            });

            // =========================
            // 💰 WALLET / COD (NO RAZORPAY)
            // =========================
            if (type === "WALLET" || type === "COD") {
                alert(res.data.message || "Payment successful");
                navigate("/payment/success");
                return;
            }

            // =========================
            // 💳 FULL PAYMENT (RAZORPAY)
            // =========================
            const options = {
                key: res.data.key,
                amount: res.data.amount,
                currency: "INR",
                name: "Go4Ryde",
                description: "Ride Payment",
                order_id: res.data.order_id,

                handler: async function (response) {
                    try {
                        await api.post("/payments/verify/", {
                            order_id: response.razorpay_order_id,
                            payment_id: response.razorpay_payment_id,
                            signature: response.razorpay_signature
                        });

                        navigate("/payment/success");
                    } catch {
                        navigate("/payment/failed");
                    }
                },

                modal: {
                    ondismiss: function () {
                        navigate("/payment/failed");
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            console.error(err.response?.data || err.message);

            alert(
                err.response?.data?.error ||
                "Payment failed"
            );
        } finally {
            setPaying(false);
        }
    };
    const handleRemainingPayment = async () => {

    try {

        setPaying(true);

        const res = await api.post(
            `/payments/remaining-payment/${booking.id}/`
        );

        const options = {

            key: res.data.key,

            amount: res.data.amount,

            currency: "INR",

            name: "Go4Ryde",

            description:
                "Remaining Ride Payment",

            order_id: res.data.order_id,

            handler: async function (
                response
            ) {

                try {

                    await api.post(
                        "/payments/verify/",
                        {
                            order_id:
                                response.razorpay_order_id,

                            payment_id:
                                response.razorpay_payment_id,

                            signature:
                                response.razorpay_signature
                        }
                    );

                    navigate(
                        "/payment/success"
                    );

                } catch {

                    navigate(
                        "/payment/failed"
                    );
                }
            },

            modal: {

                ondismiss() {

                    navigate(
                        "/payment/failed"
                    );
                }
            }
        };

        const rzp =
            new window.Razorpay(
                options
            );

        rzp.open();

    } catch (err) {

        alert(
            err.response?.data?.error ||
            "Payment failed"
        );

    } finally {

        setPaying(false);
    }
};
    if (loading) return <div className="payment-loading">Loading...</div>;
    if (!booking) return null;

    return (
        <div className="payment-wrapper">
            <div className="payment-card">

                <h2>Complete Payment</h2>

                <div className="route">
                    {ride?.source} → {ride?.destination}
                </div>

                <div className="details">
                    <p>💰 Total Fare: ₹{amount}</p>
                    <p>Status: {booking.status}</p>

                    {booking.payment_status === "PENDING" && (
                        <p className="pending">
                            ⏳ Complete your payment
                        </p>
                    )}
                </div>

                {/* =========================
                    PAYMENT OPTIONS
                ========================= */}
                <div className="payment-actions">

    {/* PARTIAL PAYMENT FLOW */}
    {
        booking.payment_status ===
        "PARTIALLY_PAID" ? (

            <>

                <div
                    className="payment-info"
                >
                    <h3>
                        Remaining Amount
                    </h3>

                    <p>
                        ₹{remainingAmount}
                    </p>
                </div>

                <button
                    className="pay-btn full"
                    onClick={
                        handleRemainingPayment
                    }
                    disabled={paying}
                >
                    Pay Remaining ₹
                    {remainingAmount}
                </button>

            </>

        ) : (

            <>
                <button
                    className="pay-btn wallet"
                    onClick={() =>
                        handlePayment(
                            "WALLET"
                        )
                    }
                    disabled={paying}
                >
                    Pay via Wallet
                </button>

                <button
                    className="pay-btn cod"
                    onClick={() =>
                        handlePayment(
                            "COD"
                        )
                    }
                    disabled={paying}
                >
                    Cash on Ride
                </button>

                <button
                    className="pay-btn partial"
                    onClick={() =>
                        handlePayment(
                            "PARTIAL"
                        )
                    }
                    disabled={paying}
                >
                    Pay Booking Amount
                </button>

                <button
                    className="pay-btn full"
                    onClick={() =>
                        handlePayment(
                            "FULL"
                        )
                    }
                    disabled={paying}
                >
                    Pay Full ₹{amount}
                </button>
            </>
        )
    }

</div>

            </div>
        </div>
    );
}