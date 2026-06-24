import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/axiosInstance";
import "../css/Notifications.css";

export default function NotificationBell() {

    const [notifications, setNotifications] =
        useState([]);

    const navigate = useNavigate();

    const loadNotifications = async () => {

        try {

            const res = await API.get(
                "/notifications/"
            );

            setNotifications(
                res.data
            );

        } catch (error) {

            console.error(
                "Notification Error:",
                error
            );
        }
    };
    

    useEffect(() => {

        loadNotifications();

        // Refresh when notifications page marks them read
        const handleNotificationsUpdated =
            () => {

                loadNotifications();
            };

        window.addEventListener(
            "notificationsUpdated",
            handleNotificationsUpdated
        );

        // Fallback polling
        const interval = setInterval(
            loadNotifications,
            10000
        );

        return () => {

            clearInterval(interval);

            window.removeEventListener(
                "notificationsUpdated",
                handleNotificationsUpdated
            );
        };

    }, []);

    const unreadCount =
        notifications.filter(
            notification => !notification.is_read
        ).length;

    const handleOpenNotifications =
        () => {

            navigate(
                "/notifications"
            );
        };

    return (

        <button
            className="notification-btn"
            onClick={
                handleOpenNotifications
            }
        >

            🔔

            {unreadCount > 0 && (

                <span
                    className="notification-badge"
                >
                    {unreadCount}
                </span>

            )}

        </button>
    );
}