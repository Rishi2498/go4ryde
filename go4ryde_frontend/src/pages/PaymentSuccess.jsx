import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function PaymentSuccess() {
    const navigate = useNavigate();

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>🎉 Payment Successful</h2>
            <p>Your ride has been booked successfully.</p>

            <button onClick={() => navigate("/my-bookings")}>
                Go to My Bookings
            </button>
        </div>
    );
}