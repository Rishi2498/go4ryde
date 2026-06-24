import {
    useNavigate,
    useParams
} from "react-router-dom";

import "../css/pages/PaymentFailed.css";

export default function PaymentFailed() {

    const navigate = useNavigate();

    const { id } = useParams();

    return (

        <div className="payment-failed-page">

            <div className="payment-failed-card">

                <div className="payment-failed-icon">
                    ✕
                </div>

                <h1 className="payment-failed-title">
                    Payment Failed
                </h1>

                <p className="payment-failed-message">
                    We couldn't process your payment.
                    Please try again or use a different
                    payment method.
                </p>

                <div className="payment-failed-actions">

                    <button
                        className="payment-failed-primary-btn"
                        onClick={() =>
                            navigate(
                                `/payment/${id}`
                            )
                        }
                    >
                        Retry Payment
                    </button>

                   

                    <button
                        className="payment-failed-secondary-btn"
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