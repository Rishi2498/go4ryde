import {useEffect, useState} from "react";
import api from "../utils/axiosInstance";
import {useNavigate} from "react-router-dom";
import "../css/Notification_page.css";

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        let mounted = true;

        const loadNotifications = async () => {
            try {
                // Mark all notifications as read
                await api.post(
                    "/notifications/notifications/read-all/"
                );

                // Get notifications once
                const response = await api.get(
                    "/notifications/"
                );

                if (mounted) {
                    setNotifications(response.data);
                }

                // Tell the notification bell to refresh its count
                window.dispatchEvent(
                    new Event("notificationsUpdated")
                );

            } catch (error) {
                console.error(
                    "Notification Error:",
                    error
                );
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadNotifications();

        return () => {
            mounted = false;
        };
    }, []);

    const handleNotificationClick = async (
        notification
    ) => {
        try {
            await api.post(
                `/notifications/notifications/${notification.id}/read/`
            );

            window.dispatchEvent(
                new Event("notificationsUpdated")
            );

            if (notification.metadata?.route) {
                navigate(
                    notification.metadata.route
                );
            }

        } catch (error) {
            console.error(
                "Notification Error:",
                error
            );
        }
    };

    if (loading) {
        return (
            <h2>
                Loading...
            </h2>
        );
    }

    return (
        <div className="notifications-page">

            <div className="notifications-container">

                <h2 className="notifications-title">
                    Notifications
                </h2>

                <p className="notifications-subtitle">
                    Stay updated with your rides,
                    bookings and payments.
                </p>

                {notifications.length === 0 ? (

                    <div className="no-notifications">

                        <h3>
                            No Notifications
                        </h3>

                        <p>
                            You don't have any
                            notifications yet.
                        </p>

                    </div>

                ) : (

                    notifications.map(
                        notification => (

                            <div
                                key={notification.id}
                                className={`notification-card ${
                                    notification.is_read
                                        ? "read"
                                        : "unread"
                                }`}
                                onClick={() =>
                                    handleNotificationClick(
                                        notification
                                    )
                                }
                            >

                                <div className="notification-header">

                                    <div className="notification-title">
                                        {notification.title}
                                    </div>

                                    <div
                                        className={`notification-type ${
                                            notification.notification_type?.toLowerCase()
                                        }`}
                                    >
                                        {notification.notification_type}
                                    </div>

                                </div>

                                <div className="notification-message">
                                    {notification.message}
                                </div>

                                <div className="notification-date">
                                    {new Date(
                                        notification.created_at
                                    ).toLocaleString()}
                                </div>

                            </div>
                        )
                    )

                )}

            </div>

        </div>
    );
}