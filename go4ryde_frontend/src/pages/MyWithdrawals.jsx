import { useEffect, useState } from "react";
import api from "../utils/axiosInstance";
import "../css/pages/MyWithdrawals.css";

export default function MyWithdrawals() {

    const [withdrawals, setWithdrawals] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {

        fetchWithdrawals();

    }, []);

    const fetchWithdrawals = async () => {

        try {

            const response =
                await api.get(
                    "/payments/wallet/my-withdrawals/"
                );

            setWithdrawals(
                response.data
            );

        } catch (error) {

            console.error(
                "Withdrawals Error:",
                error
            );

        } finally {

            setLoading(false);
        }
    };

    if (loading) {

        return (

            <div
                className="withdrawals-loading"
            >
                Loading...
            </div>

        );
    }

    return (

        <div className="withdrawals-page">

            <div className="withdrawals-container">

                <h1 className="withdrawals-title">
                    My Withdrawals
                </h1>

                <p className="withdrawals-subtitle">
                    Track all withdrawal
                    requests and their status.
                </p>

                {withdrawals.length === 0 ? (

                    <div className="withdrawals-empty">

                        <h3>
                            No Withdrawals Found
                        </h3>

                        <p>
                            You haven't made any
                            withdrawal requests yet.
                        </p>

                    </div>

                ) : (

                    withdrawals.map(
                        withdrawal => (

                            <div
                                key={withdrawal.id}
                                className="withdrawal-card"
                            >

                                <div
                                    className="withdrawal-header"
                                >

                                    <div>

                                        <h3>
                                            ₹
                                            {withdrawal.amount}
                                        </h3>

                                        <small>
                                            Request #
                                            {withdrawal.id}
                                        </small>

                                    </div>

                                    <span
                                        className={`withdrawal-status ${
                                            withdrawal.status?.toLowerCase()
                                        }`}
                                    >
                                        {
                                            withdrawal.status
                                        }
                                    </span>

                                </div>

                                <div
                                    className="withdrawal-body"
                                >

                                    <p>
                                        Created:
                                    </p>

                                    <strong>
                                        {
                                            new Date(
                                                withdrawal.created_at
                                            ).toLocaleString()
                                        }
                                    </strong>

                                </div>

                            </div>

                        )
                    )

                )}

            </div>

        </div>

    );
}