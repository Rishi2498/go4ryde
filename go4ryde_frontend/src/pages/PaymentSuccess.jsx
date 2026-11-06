import { useNavigate } from "react-router-dom";
import "../css/pages/PaymentSuccess.css";

export default function PaymentSuccess() {

    const navigate = useNavigate();

    return (

        <div className="payment-success-page">

            <div className="payment-success-card">

                <div className="success-icon">
                    ✓
                </div>

                <h1>
                    Payment Successful
                </h1>

                <p>
                    Your payment has been processed successfully.
                    Your ride booking is now confirmed.
                </p>

                <div className="success-actions">

                    <button
                        className="payment-success-primary-btn"
                        onClick={() =>
                            navigate("/my-bookings")
                        }
                    >
                        View My Bookings
                    </button>

                    <button
                        className="payment-success-secondary-btn"
                        onClick={() =>
                            navigate("/")
                        }
                    >
                        Back to Home
                    </button>

                </div>

            </div>

        </div>
    );
}