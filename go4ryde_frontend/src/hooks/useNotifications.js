import { useEffect } from "react";

export default function useNotifications(
    onNotification
) {

    useEffect(() => {

        const token =
            localStorage.getItem("access");

        const ws = new WebSocket(
            `ws://127.0.0.1:8000/ws/notifications/?token=${token}`
        );

        ws.onmessage = (event) => {

            const data =
                JSON.parse(event.data);

            onNotification(data);
        };

        return () => {

            ws.close();
        };

    }, []);
}