import {apiRequest} from './api';

// =========================================
// 🔔 GET NOTIFICATIONS
// =========================================
export const getNotifications = async () => {
  console.log('🔔 GET NOTIFICATIONS CALLED');

  try {
    const response = await apiRequest('/notifications/', {
      method: 'GET',
    });

    console.log('🔔 NOTIFICATIONS RESPONSE:', response);

    return response;
  } catch (error) {
    console.log(
      '❌ GET NOTIFICATIONS ERROR:',
      error?.data || error?.message || error,
    );

    throw error;
  }
};

// =========================================
// 👁️ MARK ONE READ
// =========================================
export const markNotificationRead = async notificationId => {
  console.log(
    '👁️ MARK NOTIFICATION READ:',
    notificationId,
  );

  try {
    const response = await apiRequest(
      `/notifications/${notificationId}/read/`,
      {
        method: 'POST',
      },
    );

    console.log(
      '👁️ MARK READ RESPONSE:',
      response,
    );

    return response;
  } catch (error) {
    console.log(
      '❌ MARK READ ERROR:',
      error?.data || error?.message || error,
    );

    throw error;
  }
};

// =========================================
// 👁️ MARK ALL READ
// =========================================
export const markAllNotificationsRead = async () => {
  console.log('👁️ MARK ALL NOTIFICATIONS READ');

  try {
    const response = await apiRequest(
      '/notifications/read-all/',
      {
        method: 'POST',
      },
    );

    console.log(
      '👁️ MARK ALL READ RESPONSE:',
      response,
    );

    return response;
  } catch (error) {
    console.log(
      '❌ MARK ALL ERROR:',
      error?.data || error?.message || error,
    );

    throw error;
  }
}