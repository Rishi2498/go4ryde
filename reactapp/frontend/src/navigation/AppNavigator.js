import React, {useEffect, useState} from 'react';
import {AppState, StyleSheet, Text, View} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {navigationRef, navigate} from '../services/NavigationService';

import {NavigationContainer} from '@react-navigation/native';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import styles from '../styles/Navigation.styles';

// WebSocket notifications
import {
  connectNotifications,
  disconnectNotifications,
} from '../services/notificationSocket';

// Notification context
import {
  NotificationProvider,
  useNotificationContext,
} from '../context/NotificationContext';

// Firebase notifications
import {
  requestNotificationPermission,
  getFCMToken,
  registerFCMTokenWithBackend,
  listenForFCMTokenRefresh,
  listenForForegroundMessages,
  listenForNotificationOpened,
  getInitialFCMNotification,
} from '../services/firebaseNotificationService';

// Global notification popup
import NotificationPopup from '../screens/notifications/NotificationPopup';

// Authentication screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import VerifyScreen from '../screens/auth/VerifyScreen';
import SplashScreen from '../screens/auth/SplashScreen';

// Main screens
import HomeScreen from '../screens/home/HomeScreen';
import FindRideScreen from '../screens/search/FindRideScreen';
import CreateRideScreen from '../screens/ride/CreateRideScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';

// Profile screens
import MyBookingsScreen from '../screens/bookings/MyBookingsScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import DriverDetailsScreen from '../screens/profile/DriverDetailsScreen';
import BankDetailsScreen from '../screens/profile/BankDetailsScreen';
import WalletScreen from '../screens/profile/WalletScreen';
import MyRidesScreen from '../screens/ride/MyRidesScreen';

// Extra screens
import SearchScreen from '../screens/search/SearchScreen';
import RideDetailsScreen from '../screens/ride/RideDetailsScreen';
import PaymentScreen from '../screens/payments/PaymentScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import BookingDetailsScreen from '../screens/bookings/BookingDetailsScreen';
import RideTrackingScreen from '../screens/ride/RideTrackingScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const containerStyles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

// Hold a notification destination until navigation is ready.
let pendingNotificationToNavigate = null;

// Tab icon
const TabIcon = ({icon, focused}) => (
  <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>
    {icon}
  </Text>
);

// Define tab icon components outside MainTabs to avoid remounting.
const HomeTabIcon = ({focused}) => (
  <TabIcon icon="⌂" focused={focused} />
);

const FindRideTabIcon = ({focused}) => (
  <TabIcon icon="⌕" focused={focused} />
);

const CreateRideTabIcon = ({focused}) => (
  <TabIcon icon="＋" focused={focused} />
);

const NotificationsTabIcon = ({focused}) => (
  <TabIcon icon="♢" focused={focused} />
);

const ProfileTabIcon = ({focused}) => (
  <TabIcon icon="◉" focused={focused} />
);

// Main tabs
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: '#16384A',
      tabBarInactiveTintColor: '#8A98A2',
      tabBarLabelStyle: styles.tabLabel,
      tabBarHideOnKeyboard: true,
    }}>

    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        title: 'Home',
        tabBarIcon: HomeTabIcon,
      }}
    />

    <Tab.Screen
      name="FindRide"
      component={FindRideScreen}
      options={{
        title: 'Find',
        tabBarIcon: FindRideTabIcon,
      }}
    />

    <Tab.Screen
      name="CreateRide"
      component={CreateRideScreen}
      options={{
        title: 'Offer',
        tabBarIcon: CreateRideTabIcon,
      }}
    />

    <Tab.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={{
        title: 'Notifications',
        tabBarIcon: NotificationsTabIcon,
      }}
    />

    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        title: 'Profile',
        tabBarIcon: ProfileTabIcon,
      }}
    />

  </Tab.Navigator>
);

// Convert an FCM message to the notification format used by the app.
const normalizeFCMNotification = remoteMessage => {
  if (!remoteMessage) {
    return null;
  }

  const data = remoteMessage.data || {};

  let metadata = {};

  if (data.metadata) {
    try {
      const parsedMetadata =
        typeof data.metadata === 'string'
          ? JSON.parse(data.metadata)
          : data.metadata;

      if (
        parsedMetadata &&
        typeof parsedMetadata === 'object' &&
        !Array.isArray(parsedMetadata)
      ) {
        metadata = parsedMetadata;
      }
    } catch (error) {
      console.log('[FCM] Invalid metadata JSON:', error);
    }
  }

  // Also accept route and IDs sent directly in the data payload.
  if (!metadata.route && data.route) {
    metadata.route = data.route;
  }

  if (!metadata.booking_id && data.booking_id) {
    metadata.booking_id = data.booking_id;
  }

  if (!metadata.ride_id && data.ride_id) {
    metadata.ride_id = data.ride_id;
  }

  return {
    id: data.id || remoteMessage.messageId || `fcm-${Date.now()}`,
    title: remoteMessage.notification?.title || data.title || 'Go4Ryde',
    message:
      remoteMessage.notification?.body ||
      data.message ||
      data.body ||
      '',
    notification_type: data.notification_type || 'GENERAL',
    is_read: false,
    created_at: data.created_at || new Date().toISOString(),
    metadata,
  };
};

// Navigate to the destination supplied by the notification.
const handleNotificationRoute = notification => {
  const metadata = notification?.metadata || {};
  const route = metadata.route;

  if (typeof route !== 'string' || !route) {
    return;
  }

  // Queue the route if React Navigation is not ready yet.
  if (!navigationRef.isReady()) {
    pendingNotificationToNavigate = notification;
    console.log('[FCM] Navigation not ready; queued notification route');
    return;
  }

  // Chat
  if (route.startsWith('/chat/')) {
    const bookingId = metadata.booking_id || route.split('/')[2];

    if (bookingId) {
      navigate('Chat', {
        bookingId: Number(bookingId),
      });
    }

    return;
  }

  // Ride tracking
  if (route.startsWith('/tracking/')) {
    const rideId = metadata.ride_id || route.split('/')[2];

    if (rideId) {
      navigate('RideTracking', {
        rideId: Number(rideId),
      });
    }

    return;
  }

  // Ride details
  if (route.startsWith('/ride/')) {
    const rideId = metadata.ride_id || route.split('/')[2];

    if (rideId) {
      navigate('RideDetails', {
        rideId: Number(rideId),
      });
    }

    return;
  }

  // Booking details
  if (route.startsWith('/booking/')) {
    const bookingId = metadata.booking_id || route.split('/')[2];

    if (bookingId) {
      navigate('BookingDetails', {
        bookingId: Number(bookingId),
      });
    }

    return;
  }

  // Wallet
  if (route === '/wallet' || route === '/profile/wallet') {
    navigate('Wallet');
  }
};

// App navigator content
const AppNavigatorContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const {addNotification} = useNotificationContext();

  // Check authentication on startup.
  useEffect(() => {
    let mounted = true;

    const checkAuthentication = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');

        if (mounted) {
          setIsAuthenticated(!!token);
        }
      } catch (error) {
        console.log('Authentication check failed:', error);

        if (mounted) {
          setIsAuthenticated(false);
        }
      }
    };

    checkAuthentication();

    return () => {
      mounted = false;
    };
  }, []);

  // Firebase permission and token registration.
  useEffect(() => {
    let mounted = true;
    let unsubscribeTokenRefresh = null;

    const setupFCM = async () => {
      try {
        if (!isAuthenticated) {
          return;
        }

        const accessToken = await AsyncStorage.getItem('access_token');

        if (!mounted || !accessToken) {
          return;
        }

        console.log('[FCM] Authenticated - starting FCM setup');

        const permission = await requestNotificationPermission();

        if (!mounted) {
          return;
        }

        if (!permission) {
          console.log('[FCM] Notification permission not granted');
          return;
        }

        const fcmToken = await getFCMToken();

        if (!mounted) {
          return;
        }

        if (fcmToken) {
          const registered =
            await registerFCMTokenWithBackend(fcmToken);

          console.log(
            '[FCM] Backend registration:',
            registered ? 'SUCCESS' : 'FAILED',
          );
        } else {
          console.log('[FCM] FCM token not available');
        }

        // Register refreshed tokens with Django.
        const unsubscribe = listenForFCMTokenRefresh(
          async newToken => {
            try {
              const currentAccessToken =
                await AsyncStorage.getItem('access_token');

              if (mounted && currentAccessToken && newToken) {
                const registered =
                  await registerFCMTokenWithBackend(newToken);

                console.log(
                  '[FCM] Refreshed token registration:',
                  registered ? 'SUCCESS' : 'FAILED',
                );
              }
            } catch (error) {
              console.log(
                '[FCM] Token refresh registration failed:',
                error,
              );
            }
          },
        );

        if (mounted) {
          unsubscribeTokenRefresh = unsubscribe;
        } else {
          unsubscribe();
        }
      } catch (error) {
        console.log('[FCM] Setup failed:', error);
      }
    };

    setupFCM();

    return () => {
      mounted = false;

      if (unsubscribeTokenRefresh) {
        unsubscribeTokenRefresh();
        unsubscribeTokenRefresh = null;
      }
    };
  }, [isAuthenticated]);

  // Listen for foreground messages and notification taps.
  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    let mounted = true;

    const handleForegroundMessage = remoteMessage => {
      if (!mounted) {
        return;
      }

      const notification = normalizeFCMNotification(remoteMessage);

      if (notification) {
        addNotification(notification);
      }
    };

    const handleOpenedNotification = remoteMessage => {
      if (!mounted) {
        return;
      }

      const notification = normalizeFCMNotification(remoteMessage);

      if (!notification) {
        return;
      }

      if (notification.metadata?.route) {
        handleNotificationRoute(notification);
      } else {
        console.log(
          '[FCM] Opened notification has no route; showing popup',
        );

        addNotification(notification);
      }
    };

    const unsubscribeForeground =
      listenForForegroundMessages(handleForegroundMessage);

    const unsubscribeOpened =
      listenForNotificationOpened(handleOpenedNotification);

    // Handle a notification that launched the app from a quit state.
    getInitialFCMNotification()
      .then(remoteMessage => {
        if (!mounted || !remoteMessage) {
          return;
        }

        const notification = normalizeFCMNotification(remoteMessage);

        if (notification?.metadata?.route) {
          handleNotificationRoute(notification);
        } else if (notification) {
          addNotification(notification);
        }
      })
      .catch(error => {
        console.log(
          '[FCM] Initial notification handling failed:',
          error,
        );
      });

    return () => {
      mounted = false;
      unsubscribeForeground?.();
      unsubscribeOpened?.();
    };
  }, [isAuthenticated, addNotification]);

  // WebSocket notification connection.
  useEffect(() => {
    if (!isAuthenticated) {
      disconnectNotifications();
      return undefined;
    }

    let mounted = true;

    const handleNotification = notification => {
      if (!mounted) {
        return;
      }

      console.log('[WS] Received notification:', notification);

      // Keep existing WebSocket notifications working.
      addNotification(notification);
    };

    const startNotifications = async () => {
      try {
        await connectNotifications(handleNotification);
      } catch (error) {
        console.log('[WS] Notification connection error:', error);
      }
    };

    startNotifications();

    // Reconnect WebSocket when the app returns to the foreground.
    const appStateSubscription = AppState.addEventListener(
      'change',
      async nextAppState => {
        if (!mounted || nextAppState !== 'active') {
          return;
        }

        try {
          const token = await AsyncStorage.getItem('access_token');

          if (token) {
            console.log('[WS] App active - reconnecting notifications');

            await connectNotifications(handleNotification);
          } else {
            disconnectNotifications();
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.log('[WS] Notification reconnect error:', error);
        }
      },
    );

    return () => {
      mounted = false;
      appStateSubscription.remove();
      disconnectNotifications();
    };
  }, [isAuthenticated, addNotification]);

  // Sync authentication after navigation changes.
  const syncAuthentication = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      setIsAuthenticated(!!token);
    } catch (error) {
      console.log('Authentication sync failed:', error);
      setIsAuthenticated(false);
    }
  };

  return (
    <View style={containerStyles.root}>
      <NavigationContainer
        ref={navigationRef}
        onReady={() => {
          if (pendingNotificationToNavigate) {
            const pendingNotification = pendingNotificationToNavigate;
            pendingNotificationToNavigate = null;

            handleNotificationRoute(pendingNotification);
          }
        }}
        onStateChange={syncAuthentication}>

        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
            contentStyle: styles.stackContent,
          }}>

          {/* Authentication */}
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
          />

          <Stack.Screen
            name="Login"
            component={LoginScreen}
          />

          <Stack.Screen
            name="Register"
            component={RegisterScreen}
          />

          <Stack.Screen
            name="Verify"
            component={VerifyScreen}
          />

          {/* Main application */}
          <Stack.Screen
            name="Main"
            component={MainTabs}
          />

          {/* Profile */}
          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
          />

          <Stack.Screen
            name="MyBookings"
            component={MyBookingsScreen}
          />

          <Stack.Screen
            name="DriverDetails"
            component={DriverDetailsScreen}
          />

          <Stack.Screen
            name="BankDetails"
            component={BankDetailsScreen}
          />

          <Stack.Screen
            name="Wallet"
            component={WalletScreen}
          />

          <Stack.Screen
            name="MyRides"
            component={MyRidesScreen}
          />

          {/* Additional screens */}
          <Stack.Screen
            name="SearchScreen"
            component={SearchScreen}
          />

          <Stack.Screen
            name="BookingDetails"
            component={BookingDetailsScreen}
          />

          <Stack.Screen
            name="RideDetails"
            component={RideDetailsScreen}
          />

          <Stack.Screen
            name="Payment"
            component={PaymentScreen}
            options={{
              title: 'Payment',
            }}
          />

          <Stack.Screen
            name="Chat"
            component={ChatScreen}
          />

          <Stack.Screen
            name="RideTracking"
            component={RideTrackingScreen}
          />

        </Stack.Navigator>
      </NavigationContainer>

      {/* Global notification popup */}
      <NotificationPopup />
    </View>
  );
};

// Notification provider
const AppNavigator = () => (
  <NotificationProvider>
    <AppNavigatorContent />
  </NotificationProvider>
);

export default AppNavigator;