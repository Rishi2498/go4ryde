import {
  getMessaging,
  getToken,
  onTokenRefresh,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification as getInitialNotificationFromFirebase,
  requestPermission,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';

import {Platform, PermissionsAndroid} from 'react-native';
import {apiRequest} from './api';

const getMessagingInstance = () => getMessaging();

// Request notification permission
export const requestNotificationPermission = async () => {
  try {
    console.log('[FCM] Requesting notification permission');

    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );

        console.log('[FCM] Android permission:', result);

        return result === PermissionsAndroid.RESULTS.GRANTED;
      }

      return true;
    }

    const messagingInstance = getMessagingInstance();
    const status = await requestPermission(messagingInstance);

    return (
      status === AuthorizationStatus.AUTHORIZED ||
      status === AuthorizationStatus.PROVISIONAL
    );
  } catch (error) {
    console.log('[FCM] Permission error:', error);
    return false;
  }
};

// Get this device's FCM token
export const getFCMToken = async () => {
  try {
    const messagingInstance = getMessaging();

    console.log('[FCM] Requesting device token');

    const token = await getToken(messagingInstance);

    console.log('[FCM] Token type:', typeof token);
    console.log('[FCM] Token available:', Boolean(token));

    if (typeof token !== 'string' || token.length === 0) {
      console.log('[FCM] No valid registration token returned');
      return null;
    }

    return token;
  } catch (error) {
    console.log('[FCM] Token retrieval failed:', error?.code, error?.message);
    return null;
  }
};

// Register the device token with Django
export const registerFCMTokenWithBackend = async token => {
  if (!token) {
    
    console.log('[FCM] Cannot register an empty token');
    return false;
  }

  try {
    await apiRequest('/notifications/fcm-token/', {
      method: 'POST',
      body: JSON.stringify({token}),
    });

    console.log('[FCM] Backend registration SUCCESS');
    return true;
  } catch (error) {
    console.log('[FCM] Backend registration FAILED:', error.message);
    console.log('[FCM] API error details:', error.data);
    return false;
  }
};

// Listen for refreshed FCM tokens
export const listenForFCMTokenRefresh = callback => {
  try {
    const messagingInstance = getMessagingInstance();

    return onTokenRefresh(messagingInstance, async token => {
      console.log('[FCM] Device token refreshed');

      if (callback) {
        await callback(token);
      }
    });
  } catch (error) {
    console.log('[FCM] Token refresh listener error:', error);
    return () => {};
  }
};

// Listen for messages received while the app is open
export const listenForForegroundMessages = callback => {
  try {
    const messagingInstance = getMessagingInstance();

    return onMessage(messagingInstance, remoteMessage => {
      console.log('[FCM] Foreground message received:', remoteMessage);
      callback?.(remoteMessage);
    });
  } catch (error) {
    console.log('[FCM] Foreground listener error:', error);
    return () => {};
  }
};

// Listen when a user taps a notification while the app is in the background
export const listenForNotificationOpened = callback => {
  try {
    const messagingInstance = getMessagingInstance();

    return onNotificationOpenedApp(messagingInstance, remoteMessage => {
      console.log('[FCM] Notification opened from background:', remoteMessage);
      callback?.(remoteMessage);
    });
  } catch (error) {
    console.log('[FCM] Notification-open listener error:', error);
    return () => {};
  }
};

// Get the notification that launched the app from a quit state
export const getInitialFCMNotification = async () => {
  try {
    const messagingInstance = getMessagingInstance();

    const remoteMessage =
      await getInitialNotificationFromFirebase(messagingInstance);

    console.log(
      '[FCM] Initial notification:',
      remoteMessage || 'None',
    );

    return remoteMessage || null;
  } catch (error) {
    console.log('[FCM] Initial notification error:', error);
    return null;
  }
};