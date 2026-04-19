export const createChatSocket = (rideId, token, onMessage) => {
    const ws = new WebSocket(
        `ws://localhost:8000/ws/chat/${rideId}/?token=${token}`
    );

    ws.onopen = () => {
        console.log("✅ WebSocket connected");
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        onMessage(data);
    };

    ws.onclose = () => {
        console.log("❌ WebSocket disconnected");
    };

    return ws;
};