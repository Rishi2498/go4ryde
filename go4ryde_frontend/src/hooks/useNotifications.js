import {useEffect} from "react";

export default function useNotifications(onNotification) {
    useEffect(() => {
        const token = localStorage.getItem("access");

        // Don't connect if the user isn't logged in
        if (!token) {
            return;
        }

        const ws = new WebSocket(
            `ws://127.0.0.1:8000/ws/notifications/?token=${token}`
        );

        ws.onopen = () => {
            console.log("Notifications WebSocket connected");
        };

        ws.onmessage = event => {
            try {
                const data = JSON.parse(event.data);

                if (onNotification) {
                    onNotification(data);
                }
            } catch (error) {
                console.error(
                    "Notification WebSocket message error:",
                    error
                );
            }
        };

        ws.onerror = error => {
            console.error(
                "Notification WebSocket error:",
                error
            );
        };

        ws.onclose = () => {
            console.log(
                "Notifications WebSocket disconnected"
            );
        };

        return () => {
            ws.close();
        };
    }, [onNotification]);
}