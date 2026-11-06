import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import API from "../utils/axiosInstance";
import "../css/Notifications.css";

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);

    const navigate = useNavigate();

    const loadNotifications = async () => {
        try {
            const res = await API.get("/notifications/");

            setNotifications(res.data);
        } catch (error) {
            console.error(
                "Notification Error:",
                error
            );
        }
    };

    useEffect(() => {
        // Load notifications only once when the bell is mounted.
        loadNotifications();

        // Refresh only when another part of the website
        // explicitly says that notifications changed.
        const handleNotificationsUpdated = () => {
            loadNotifications();
        };

        window.addEventListener(
            "notificationsUpdated",
            handleNotificationsUpdated
        );

        return () => {
            window.removeEventListener(
                "notificationsUpdated",
                handleNotificationsUpdated
            );
        };
    }, []);

    const unreadCount = notifications.filter(
        notification => !notification.is_read
    ).length;

    const handleOpenNotifications = () => {
        navigate("/notifications");
    };

    return (
        <button
            className="notification-btn"
            onClick={handleOpenNotifications}
        >
            🔔

            {unreadCount > 0 && (
                <span className="notification-badge">
                    {unreadCount}
                </span>
            )}
        </button>
    );
}