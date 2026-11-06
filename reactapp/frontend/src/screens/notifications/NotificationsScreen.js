import React, {useCallback, useState} from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';

import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../services/notificationService';

import {useNotificationContext} from '../../context/NotificationContext';

import styles from '../../styles/NotificationsScreen.styles';


const NotificationsScreen = () => {

  const navigation = useNavigation();

  const {
    notifications,
    setNotificationList,
    markNotificationRead: markContextNotificationRead,
  } = useNotificationContext();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);


  // =========================================
  // 🔔 LOAD NOTIFICATIONS
  // =========================================
  const loadNotifications = useCallback(
    async (showLoader = true) => {

      try {

        if (showLoader) {
          setLoading(true);
        }

        console.log(
          '🔔 LOADING NOTIFICATIONS'
        );

        const data = await getNotifications();

        console.log(
          '🔔 NOTIFICATION API DATA:',
          data
        );


        // =====================================
        // IMPORTANT
        // Backend returns:
        //
        // {
        //   notifications: [],
        //   unread_count: 0,
        //   total_count: 0
        // }
        // =====================================

        const fetchedNotifications = Array.isArray(data)
  ? data
  : Array.isArray(data?.notifications)
    ? data.notifications
    : [];

console.log(
  '🔔 FETCHED NOTIFICATIONS:',
  fetchedNotifications
);


        // Merge API notifications with existing live notifications.
const existing = Array.isArray(notifications)
  ? notifications
  : [];

const merged = new Map();

// Add API notifications first.
fetchedNotifications.forEach(item => {
  merged.set(String(item.id), item);
});

// Preserve live notifications and existing read status.
existing.forEach(item => {
  const id = String(item.id);
  const apiItem = merged.get(id);

  if (!apiItem) {
    merged.set(id, item);
  } else {
    merged.set(id, {
      ...item,
      ...apiItem,
      is_read: Boolean(item.is_read || apiItem.is_read),
    });
  }
});

const combinedNotifications = Array.from(merged.values()).sort(
  (a, b) =>
    new Date(b.created_at || 0).getTime() -
    new Date(a.created_at || 0).getTime(),
);

console.log(
  '🔔 SAVING NOTIFICATIONS COUNT:',
  combinedNotifications.length,
);

setNotificationList(combinedNotifications);
      } catch (error) {

        console.log(
          '❌ NOTIFICATIONS ERROR:',
          error
        );

        Alert.alert(
          'Notifications',
          error?.message ||
            'Unable to load notifications.'
        );

      } finally {

        setLoading(false);
        setRefreshing(false);

      }

    },
    [setNotificationList]
  );


  // =========================================
  // 🔄 LOAD WHEN SCREEN OPENS
  // =========================================

  useFocusEffect(
    useCallback(() => {

      loadNotifications();

    }, [loadNotifications])
  );


  // =========================================
  // 🔄 REFRESH
  // =========================================

  const handleRefresh = () => {

    setRefreshing(true);

    loadNotifications(false);

  };


  // =========================================
  // 🧭 NAVIGATION
  // =========================================

const handleNotificationNavigation = notification => {
  const metadata = notification?.metadata || {};
  const route = metadata?.route;

  console.log('🧭 NOTIFICATION ROUTE:', route);
  console.log('🧭 NOTIFICATION METADATA:', metadata);

  if (!route) {
    console.log('⚠️ Notification has no route');
    return;
  }

  // 💬 CHAT
  if (route.startsWith('/chat/')) {
    const bookingId =
      metadata.booking_id ||
      route.split('/')[2];

    navigation.navigate('Chat', {
      bookingId: Number(bookingId),
    });

    return;
  }

  // 📍 TRACKING
  if (route.startsWith('/tracking/')) {
    const rideId =
      metadata.ride_id ||
      route.split('/')[2];

    navigation.navigate('RideTracking', {
      rideId: Number(rideId),
    });

    return;
  }

  // 🚗 RIDE
  if (route.startsWith('/ride/')) {
    const rideId =
      metadata.ride_id ||
      route.split('/')[2];

    navigation.navigate('RideDetails', {
      rideId: Number(rideId),
    });

    return;
  }

  // 📋 BOOKING
  if (route.startsWith('/booking/')) {
    const bookingId =
      metadata.booking_id ||
      route.split('/')[2];

    navigation.navigate('BookingDetails', {
      bookingId: Number(bookingId),
    });

    return;
  }

  // 💰 WALLET
  if (
    route === '/wallet' ||
    route === '/profile/wallet'
  ) {
    navigation.navigate('Wallet');
    return;
  }

  console.log(
    '⚠️ UNKNOWN NOTIFICATION ROUTE:',
    route,
  );
};


  // =========================================
  // 👁️ PRESS NOTIFICATION
  // =========================================

  const handleNotificationPress = async (
    notification
  ) => {

    console.log(
      '🔔 NOTIFICATION PRESSED:',
      notification
    );


    // =====================================
    // MARK READ
    // =====================================

    if (!notification.is_read) {

      try {

        await markNotificationRead(
          notification.id
        );

        markContextNotificationRead(
          notification.id
        );

      } catch (error) {

        console.log(
          '❌ MARK NOTIFICATION ERROR:',
          error
        );

      }

    }


    // =====================================
    // NAVIGATE EVEN IF ALREADY READ
    // =====================================

    handleNotificationNavigation(
      notification
    );

  };


  // =========================================
  // 👁️ MARK ALL READ
  // =========================================

  const handleMarkAllRead = async () => {

    try {

      await markAllNotificationsRead();


      setNotificationList(
        current =>
          current.map(item => ({
            ...item,
            is_read: true,
          }))
      );


    } catch (error) {

      console.log(
        '❌ MARK ALL READ ERROR:',
        error
      );

      Alert.alert(
        'Notifications',
        error?.message ||
          'Unable to mark notifications as read.'
      );

    }

  };


  // =========================================
  // 🔢 UNREAD COUNT
  // =========================================

  const unreadCount =
    notifications.filter(
      notification =>
        !notification.is_read
    ).length;


  // =========================================
  // 🔔 ICON
  // =========================================

  const getNotificationIcon = (
    type
  ) => {

    switch (type) {

      case 'CHAT':
        return '💬';

      case 'BOOKING':
        return '📋';

      case 'RIDE':
        return '🚗';

      case 'PAYMENT':
        return '💳';

      case 'WALLET':
        return '💰';

      case 'WITHDRAWAL':
        return '🏦';

      default:
        return '🔔';

    }

  };


  // =========================================
  // 📅 DATE
  // =========================================

  const formatDate = date => {

    if (!date) {
      return '';
    }

    try {

      return new Date(
        date
      ).toLocaleString();

    } catch {

      return '';

    }

  };


  // =========================================
  // 🔔 NOTIFICATION CARD
  // =========================================

  const renderNotification = ({
    item
  }) => (

    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() =>
        handleNotificationPress(item)
      }
      style={[
        styles.notificationCard,
        !item.is_read &&
          styles.unreadCard,
      ]}>

      {/* ICON */}

      <View style={styles.iconContainer}>

        <Text style={styles.icon}>

          {getNotificationIcon(
            item.notification_type
          )}

        </Text>

      </View>


      {/* CONTENT */}

      <View style={styles.content}>

        <View style={styles.titleRow}>

          <Text
            style={styles.notificationTitle}
            numberOfLines={1}>

            {item.title}

          </Text>


          {!item.is_read && (

            <View
              style={styles.unreadDot}
            />

          )}

        </View>


        <Text
          style={styles.message}>

          {item.message}

        </Text>


        {item.created_at && (

          <Text style={styles.date}>

            {formatDate(
              item.created_at
            )}

          </Text>

        )}

      </View>

    </TouchableOpacity>

  );


  // =========================================
  // ⏳ LOADING
  // =========================================

  if (loading) {

    return (

      <SafeAreaView
        style={styles.container}>

        <View
          style={
            styles.loadingContainer
          }>

          <ActivityIndicator
            size="large"
          />

          <Text
            style={
              styles.loadingText
            }>

            Loading notifications...

          </Text>

        </View>

      </SafeAreaView>

    );

  }


  // =========================================
  // 🔔 SCREEN
  // =========================================

  return (

    <SafeAreaView
      style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>

        <View>

          <Text style={styles.title}>

            Notifications

          </Text>


          {unreadCount > 0 && (

            <Text
              style={
                styles.unreadText
              }>

              {unreadCount} unread

            </Text>

          )}

        </View>


        {unreadCount > 0 && (

          <TouchableOpacity
            onPress={
              handleMarkAllRead
            }
            style={
              styles.markAllButton
            }>

            <Text
              style={
                styles.markAllText
              }>

              Mark all read

            </Text>

          </TouchableOpacity>

        )}

      </View>


      {/* EMPTY */}

      {notifications.length === 0 ? (

        <View
          style={
            styles.emptyContainer
          }>

          <Text
            style={
              styles.emptyIcon
            }>

            🔔

          </Text>


          <Text
            style={
              styles.emptyTitle
            }>

            No notifications

          </Text>


          <Text
            style={
              styles.emptyMessage
            }>

            You're all caught up.

          </Text>

        </View>

      ) : (

        <FlatList
          data={notifications}

          keyExtractor={item =>
            String(item.id)
          }

          renderItem={
            renderNotification
          }

          contentContainerStyle={
            styles.listContent
          }

          refreshControl={

            <RefreshControl
              refreshing={
                refreshing
              }
              onRefresh={
                handleRefresh
              }
            />

          }

          showsVerticalScrollIndicator={
            false
          }

        />

      )}

    </SafeAreaView>

  );

};


export default NotificationsScreen;