import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {navigate} from '../../services/NavigationService';

// import {
//   useNavigation,
// } from '@react-navigation/native';

import {
  useNotificationContext,
} from '../../context/NotificationContext';


const NotificationPopup = () => {

//   const navigation =
//     useNavigation();

  const {
    activeNotification,
    dismissNotification,
    markNotificationRead,
  } = useNotificationContext();


  const translateY =
    useRef(
      new Animated.Value(-150)
    ).current;


  // =========================================
  // 🔔 SHOW / HIDE ANIMATION
  // =========================================

  useEffect(() => {

    if (!activeNotification) {
      return;
    }


    // Slide down
    Animated.spring(
      translateY,
      {
        toValue: 0,
        useNativeDriver: true,
        tension: 70,
        friction: 9,
      }
    ).start();


    // Auto hide after 5 seconds
    const timer =
      setTimeout(() => {

        Animated.timing(
          translateY,
          {
            toValue: -150,
            duration: 250,
            useNativeDriver: true,
          }
        ).start(() => {

          dismissNotification();

        });

      }, 5000);


    return () => {
      clearTimeout(timer);
    };

  }, [
    activeNotification,
    dismissNotification,
    translateY,
  ]);


  if (!activeNotification) {
    return null;
  }


  // =========================================
  // 🧭 NAVIGATION
  // =========================================

  const handlePress = () => {
  const notification = activeNotification;

  const metadata = notification?.metadata || {};
  const route = metadata?.route;

  console.log('🔔 POPUP PRESSED:', notification);

  // Mark read locally
  markNotificationRead(notification.id);

  // Close popup
  dismissNotification();

  if (!route) {
    return;
  }

  // 💬 CHAT
  if (route.startsWith('/chat/')) {
    const bookingId =
      metadata.booking_id ||
      route.split('/')[2];

    navigate('Chat', {
      bookingId: Number(bookingId),
    });

    return;
  }

  // 📍 TRACKING
  if (route.startsWith('/tracking/')) {
    const rideId =
      metadata.ride_id ||
      route.split('/')[2];

    navigate('RideTracking', {
      rideId: Number(rideId),
    });

    return;
  }

  // 🚗 RIDE
  if (route.startsWith('/ride/')) {
    const rideId =
      metadata.ride_id ||
      route.split('/')[2];

    navigate('RideDetails', {
      rideId: Number(rideId),
    });

    return;
  }

  // 📋 BOOKING
  if (route.startsWith('/booking/')) {
    const bookingId =
      metadata.booking_id ||
      route.split('/')[2];

    navigate('BookingDetails', {
      bookingId: Number(bookingId),
    });

    return;
  }

  // 💰 WALLET
  if (
    route === '/wallet' ||
    route === '/profile/wallet'
  ) {
    navigate('Wallet');
    return;
  }
};

  return (

    <Animated.View
      style={{
        position: 'absolute',

        top: 45,

        left: 12,

        right: 12,

        zIndex: 9999,

        elevation: 9999,

        transform: [
          {
            translateY,
          },
        ],
      }}>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}>

        <View
          style={{
            backgroundColor: '#FFFFFF',

            borderRadius: 16,

            padding: 16,

            flexDirection: 'row',

            alignItems: 'center',

            shadowColor: '#000',

            shadowOffset: {
              width: 0,
              height: 4,
            },

            shadowOpacity: 0.2,

            shadowRadius: 8,

            elevation: 8,

            borderWidth: 1,

            borderColor:
              '#E8E8E8',
          }}>

          {/* ICON */}

          <View
            style={{
              width: 46,

              height: 46,

              borderRadius: 23,

              alignItems:
                'center',

              justifyContent:
                'center',

              backgroundColor:
                '#F1F5F7',

              marginRight: 12,
            }}>

            <Text
              style={{
                fontSize: 22,
              }}>

              🔔

            </Text>

          </View>


          {/* CONTENT */}

          <View
            style={{
              flex: 1,
            }}>

            <Text
              numberOfLines={1}
              style={{
                fontSize: 16,

                fontWeight: '700',

                color: '#16384A',

                marginBottom: 4,
              }}>

              {
                activeNotification.title
              }

            </Text>


            <Text
              numberOfLines={2}
              style={{
                fontSize: 14,

                color: '#5D6870',

                lineHeight: 20,
              }}>

              {
                activeNotification.message
              }

            </Text>

          </View>

        </View>

      </TouchableOpacity>

    </Animated.View>

  );

};


export default NotificationPopup;