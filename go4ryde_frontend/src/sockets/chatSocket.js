export const createChatSocket = (rideId, token, onMessage) => {
    let socket = null;
    let reconnectTimeout = null;
    let isManuallyClosed = false;

    const WS_URL = `ws://localhost:8000/ws/chat/${rideId}/?token=${token}`;

    const connect = () => {
        if (isManuallyClosed) return;

        console.log("🔌 Connecting WebSocket...");

        socket = new WebSocket(WS_URL);

        socket.onopen = () => {
            console.log("✅ WebSocket Connected");
        };

        socket.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                onMessage(data);
            } catch (err) {
                console.error("❌ WS parse error:", err);
            }
        };

        socket.onerror = (err) => {
            console.warn("⚠️ WebSocket error:", err);
        };

        socket.onclose = () => {
            console.log("❌ Disconnected");

            if (!isManuallyClosed) {
                console.log("🔁 Reconnecting in 2s...");
                reconnectTimeout = setTimeout(connect, 2000);
            }
        };
    };

    connect();

    return {
        // ✅ Safe send
        send: (data) => {
            if (!socket || socket.readyState !== WebSocket.OPEN) {
                console.warn("⚠️ Cannot send → socket not ready");
                return false;
            }

            socket.send(data);
            return true;
        },

        // ⌨️ Typing indicator support
        sendTyping: (isTyping) => {
            if (!socket || socket.readyState !== WebSocket.OPEN) return;

            socket.send(JSON.stringify({ typing: isTyping }));
        },

        // 👁️ Read receipt support
        sendRead: () => {
            if (!socket || socket.readyState !== WebSocket.OPEN) return;

            socket.send(JSON.stringify({ read: true }));
        },

        // 🔌 Manual close (important)
        close: () => {
            console.log("🛑 Socket manually closed");

            isManuallyClosed = true;

            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
            }

            socket?.close();
        },

        // 📊 expose state
        get readyState() {
            return socket?.readyState;
        }
    };
};