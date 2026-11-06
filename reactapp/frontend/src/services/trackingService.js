
import {apiRequest, API_BASE_URL_VALUE} from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Send the driver's latest GPS position to Django.
export const updateDriverLocation = ({
  rideId,
  latitude,
  longitude,
  heading,
  speed,
}) => {
  return apiRequest('/tracking/update-location/', {
    method: 'POST',
    body: JSON.stringify({
      ride_id: rideId,
      lat: latitude,
      lng: longitude,
      ...(heading != null ? {heading} : {}),
      ...(speed != null ? {speed} : {}),
    }),
  });
};

// Fetch the most recently saved driver location.
export const getDriverLocation = rideId => {
  return apiRequest(
    `/tracking/driver-location/${rideId}/`,
    {method: 'GET'},
  );
};

// Build the authenticated WebSocket URL.
export const getTrackingWebSocketUrl = async rideId => {
  const token = await AsyncStorage.getItem('access_token');

  if (!token) {
    throw new Error('Please log in to use live tracking.');
  }

  // Convert the HTTP API base URL to a WebSocket base URL.
  // Remove the trailing /api suffix.
  const wsBaseUrl = API_BASE_URL_VALUE
    .replace(/^https:/, 'wss:')
    .replace(/^http:/, 'ws:')
    .replace(/\/api\/?$/, '')
    .replace(/\/+$/, '');

  return `${wsBaseUrl}/ws/tracking/${rideId}/?token=${encodeURIComponent(token)}`;
  
};
