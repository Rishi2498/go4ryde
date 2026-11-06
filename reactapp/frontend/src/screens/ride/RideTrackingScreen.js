
import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';

import {
  getDriverLocation,
  getTrackingWebSocketUrl,
} from '../../services/trackingService';

const RideTrackingScreen = ({navigation, route}) => {
  const {booking, rideId} = route?.params || {};

  const [location, setLocation] = useState(null);
  const [connectionStatus, setConnectionStatus] =
    useState('Connecting...');
  const [error, setError] = useState('');

  const socketRef = useRef(null);

  useEffect(() => {
    if (!rideId) {
      setError('Ride ID is missing.');
      return;
    }

    let mounted = true;
    let socket;

    const applyLocation = data => {
      const lat = Number(data?.lat);
      const lng = Number(data?.lng);

      if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng) ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180
      ) {
        return;
      }

      setLocation({latitude: lat, longitude: lng});
      setError('');
    };

    const connectTracking = async () => {
      // Load the latest saved location first.
      try {
        const response = await getDriverLocation(rideId);

        if (!mounted) return;

        if (response?.tracking_available) {
          applyLocation(response);
        }
      } catch (err) {
        if (mounted) {
          setError(
            'Unable to load the driver location yet.',
          );
        }
      }

      // Connect for live updates.
      try {
        const url = await getTrackingWebSocketUrl(rideId);

        if (!mounted) return;

        socket = new WebSocket(url);
        socketRef.current = socket;

        socket.onopen = () => {
          if (mounted) {
            setConnectionStatus('Live connection');
          }
        };

        socket.onmessage = event => {
          try {
            const data = JSON.parse(event.data);

            if (Number(data.ride_id) === Number(rideId)) {
              applyLocation(data);
            }
          } catch (err) {
            console.warn('Invalid tracking message:', err);
          }
        };

        socket.onerror = () => {
          if (mounted) {
            setConnectionStatus('Connection issue');
          }
        };

        socket.onclose = () => {
          if (mounted) {
            setConnectionStatus('Disconnected');
          }
        };
      } catch (err) {
        if (mounted) {
          setConnectionStatus('Unable to connect');
          setError(err?.message || 'Tracking connection failed.');
        }
      }
    };

    connectTracking();

    return () => {
      mounted = false;

      if (socket) {
        socket.onopen = null;
        socket.onmessage = null;
        socket.onerror = null;
        socket.onclose = null;
        socket.close();
      }

      socketRef.current = null;
    };
  }, [rideId]);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#050711'}}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#050711"
      />

      <View style={{padding: 18}}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{color: '#C4B5FD', fontSize: 16}}>
            ‹ Back
          </Text>
        </TouchableOpacity>

        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 24,
            fontWeight: '700',
            marginTop: 16,
          }}>
          Live Ride Tracking
        </Text>

        <Text style={{color: '#A1A1AA', marginTop: 6}}>
          Booking #{booking?.id ?? '—'} · {connectionStatus}
        </Text>
      </View>

      {location ? (
        <MapView
          style={{flex: 1}}
          initialRegion={{
            ...location,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          }}
          region={{
            ...location,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          }}>
          <Marker
            coordinate={location}
            title="Driver"
            description="Latest driver location"
          />
        </MapView>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          }}>
          <ActivityIndicator size="large" color="#A855F7" />

          <Text
            style={{
              color: '#FFFFFF',
              marginTop: 16,
              textAlign: 'center',
            }}>
            Waiting for the driver's location...
          </Text>

          {!!error && (
            <Text
              style={{
                color: '#FCA5A5',
                marginTop: 10,
                textAlign: 'center',
              }}>
              {error}
            </Text>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

export default RideTrackingScreen;
