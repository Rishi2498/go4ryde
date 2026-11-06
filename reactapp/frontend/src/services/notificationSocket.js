
import AsyncStorage from '@react-native-async-storage/async-storage';

const WS_BASE_URL = 'ws://10.0.2.2:8001/ws/notifications/';

let socket = null;
let currentCallback = null;

export const connectNotifications = async onNotification => {
  currentCallback = onNotification;

  const token = await AsyncStorage.getItem('access_token');

  if (!token) {
    console.log('[WS] No access token found');
    return null;
  }

  if (
    socket &&
    (socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING)
  ) {
    console.log('[WS] Reusing existing socket; state:', socket.readyState);
    return socket;
  }

  const url = `${WS_BASE_URL}?token=${encodeURIComponent(token)}`;
  console.log('[WS] Connecting to:', WS_BASE_URL);

  socket = new WebSocket(url);

  socket.onopen = () => {
    console.log('[WS] CONNECTED');
  };

  socket.onmessage = event => {
    console.log('[WS] RAW MESSAGE:', event.data);

    try {
      const notification = JSON.parse(event.data);
      console.log('[WS] PARSED NOTIFICATION:', notification);
      currentCallback?.(notification);
    } catch (error) {
      console.log('[WS] Message parsing error:', error);
    }
  };

  socket.onerror = error => {
    console.log('[WS] ERROR:', error);
  };

  socket.onclose = event => {
    console.log('[WS] CLOSED:', event.code, event.reason);

    socket = null;
  };

  return socket;
};

export const disconnectNotifications = () => {
  if (socket) {
    const oldSocket = socket;
    socket = null;
    oldSocket.close();
  }
  currentCallback = null;
};

