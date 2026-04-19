import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function PaymentFailed() {
    const navigate = useNavigate();

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>❌ Payment Failed</h2>
            <p>Something went wrong. Try again.</p>

            <button onClick={() => navigate("/")}>
                Back to Home
            </button>
        </div>
    );
}