import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://10.0.2.2:8001/api';

const ACCESS_TOKEN = 'access_token';
const REFRESH_TOKEN = 'refresh_token';
const USER_ROLE = 'user_role';
const USER_DATA = 'user_data';
const NOTIFICATIONS_WS_URL = 'ws://10.0.2.2:8001/ws/notifications/';
const getAccessToken = async () => AsyncStorage.getItem(ACCESS_TOKEN);
const getRefreshToken = async () => AsyncStorage.getItem(REFRESH_TOKEN);

const saveAccessToken = async token => {
  if (token) {
    await AsyncStorage.setItem(ACCESS_TOKEN, token);
  }
};

const clearAuthentication = async () => {
  await AsyncStorage.multiRemove([
    ACCESS_TOKEN,
    REFRESH_TOKEN,
    USER_ROLE,
    USER_DATA,
  ]);
};

const isFormData = body => {
  return typeof FormData !== 'undefined' && body instanceof FormData;
};

const refreshAccessToken = async () => {
  const refresh = await getRefreshToken();

  if (!refresh) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({refresh}),
    });

    const text = await response.text();
    let data = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {};
    }

    if (!response.ok || !data?.access) {
      await clearAuthentication();
      return null;
    }

    await saveAccessToken(data.access);
    return data.access;
  } catch (error) {
    console.log('TOKEN REFRESH ERROR:', error);
    await clearAuthentication();
    return null;
  }
};

export const apiRequest = async (endpoint, options = {}, retry = true) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const accessToken = await getAccessToken();
  const body = options.body;
  const formData = isFormData(body);

  const headers = {
    Accept: 'application/json',
    ...(accessToken
      ? {Authorization: `Bearer ${accessToken}`}
      : {}),
    ...(options.headers || {}),
  };

  // Never set multipart Content-Type manually. Fetch must create
  // the boundary for React Native FormData.
  if (!formData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401 && retry) {
    const newAccessToken = await refreshAccessToken();

    if (newAccessToken) {
      return apiRequest(endpoint, options, false);
    }

    const error = new Error(
      'Authentication expired. Please login again.',
    );
    error.status = 401;
    error.data = {error: 'Authentication expired.'};
    throw error;
  }

  const text = await response.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {
      error: text || 'Invalid server response',
    };
  }

  if (!response.ok) {

    console.log('❌ API ERROR STATUS:', response.status);
    console.log('❌ API ERROR DATA:', data);
    const error = new Error(
      data?.error ||
        data?.detail ||
        data?.message ||
        `Request failed with status ${response.status}`,
    );

    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const API_BASE_URL_VALUE = API_BASE_URL;

export default {
  apiRequest,
  API_BASE_URL_VALUE,
};

