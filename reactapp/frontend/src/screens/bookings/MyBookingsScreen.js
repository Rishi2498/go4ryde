import React, {useCallback, useState} from 'react';

import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {useFocusEffect} from '@react-navigation/native';

import styles from '../../styles/MyBookingsScreen.styles';

import {
  getMyBookings,
  cancelBooking,
} from '../../services/bookingService';

const MyBookingsScreen = ({navigation}) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState('');

  // ==========================================
  // LOAD BOOKINGS
  // ==========================================

  const fetchBookings = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      const response = await getMyBookings();

      // console.log(
      //   '🔥 FULL BOOKING DATA:',
      //   JSON.stringify(response, null, 2),
      // );

      const data = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.results)
        ? response.results
        : [];

      setBookings(data);
    } catch (err) {
      console.log('❌ MY BOOKINGS ERROR:', err);

      setError(
        err?.data?.error ||
          err?.data?.detail ||
          err?.message ||
          'Unable to load your bookings.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ==========================================
  // REFRESH
  // ==========================================

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, []),
  );

  // ==========================================
  // CANCEL BOOKING
  // ==========================================

  const handleCancel = bookingId => {
    Alert.alert(
      'Cancel booking?',
      'Are you sure you want to cancel this booking?',
      [
        {
          text: 'Keep booking',
          style: 'cancel',
        },
        {
          text: 'Cancel booking',
          style: 'destructive',

          onPress: async () => {
            try {
              setCancellingId(bookingId);

              console.log(
                '❌ CANCELLING BOOKING:',
                bookingId,
              );

              await cancelBooking(bookingId);

              Alert.alert(
                'Booking cancelled',
                'Your booking has been cancelled successfully.',
              );

              await fetchBookings(true);
            } catch (err) {
              console.log(
                '❌ CANCEL BOOKING ERROR:',
                err,
              );

              Alert.alert(
                'Unable to cancel',
                err?.data?.error ||
                  err?.data?.detail ||
                  err?.message ||
                  'This booking could not be cancelled.',
              );
            } finally {
              setCancellingId(null);
            }
          },
        },
      ],
    );
  };

  // ==========================================
  // STATUS
  // ==========================================

  const getStatus = booking =>
    String(
      booking?.status || 'pending',
    ).toLowerCase();

  const getPaymentStatus = booking =>
    String(
      booking?.payment_status || 'pending',
    ).toLowerCase();

  const getPaymentType = booking =>
    String(
      booking?.payment_type || '',
    ).toLowerCase();

  // ==========================================
  // COD
  // ==========================================

  const isCashPayment = booking => {
    return getPaymentType(booking) === 'cod';
  };

  // ==========================================
  // RIDE ID
  // ==========================================

  const getRideId = booking => {
    return (
      booking?.ride_id ||
      booking?.ride?.id ||
      (typeof booking?.ride === 'number'
        ? booking.ride
        : null)
    );
  };

  // ==========================================
  // RIDE TITLE
  // ==========================================

  const getRideTitle = booking => {
    if (typeof booking?.ride === 'string') {
      return booking.ride;
    }

    if (
      booking?.source &&
      booking?.destination
    ) {
      return `${booking.source} → ${booking.destination}`;
    }

    if (
      booking?.ride?.source &&
      booking?.ride?.destination
    ) {
      return `${booking.ride.source} → ${booking.ride.destination}`;
    }

    return 'Your ride';
  };

  // ==========================================
  // PAYMENT REQUIRED
  // ==========================================

  const needsPayment = booking => {
    const paymentStatus =
      getPaymentStatus(booking);

    const status =
      getStatus(booking);

    const paymentType =
      getPaymentType(booking);

    if (paymentType === 'cod') {
      return false;
    }

    return (
      status === 'pending' &&
      paymentStatus !== 'paid' &&
      paymentStatus !== 'success' &&
      status !== 'cancelled'
    );
  };

  // ==========================================
  // CHAT
  // ==========================================

  const canChat = booking => {
    const status = getStatus(booking);

    return [
      'accepted',
      'started',
      'active',
    ].includes(status);
  };

  // ==========================================
  // TRACKING
  // ==========================================

  const canTrack = booking => {
    const status = getStatus(booking);

    return [
      'started',
      'active',
    ].includes(status);
  };

  // ==========================================
  // CANCEL
  // ==========================================

  const canCancel = booking => {
    return getStatus(booking) === 'pending';
  };

  // ==========================================
  // OPEN DETAILS PAGE
  // ==========================================

  const handleDetails = booking => {
    console.log(
      '📋 OPENING BOOKING DETAILS:',
      booking,
    );

    navigation.navigate(
      'BookingDetails',
      {
        booking,
      },
    );
  };

  // ==========================================
  // OPEN CHAT
  // ==========================================

  const handleChat = booking => {
    const rideId = getRideId(booking);

    console.log(
      '💬 OPENING CHAT',
      {
        bookingId: booking?.id,
        rideId,
      },
    );

    if (!booking?.id) {
      Alert.alert(
        'Chat unavailable',
        'Booking ID is missing.',
      );
      return;
    }

    if (!rideId) {
      Alert.alert(
        'Chat unavailable',
        'Ride information is missing for this booking.',
      );
      return;
    }

    navigation.navigate(
      'Chat',
      {
        bookingId: booking.id,
        rideId,
      },
    );
  };

  // ==========================================
  // PAYMENT
  // ==========================================

  const handlePayment = booking => {
    if (!booking?.id) {
      Alert.alert(
        'Payment Error',
        'Booking ID is missing.',
      );
      return;
    }

    if (isCashPayment(booking)) {
      Alert.alert(
        'Cash Payment Selected',
        'You selected Cash on Delivery. No online payment is required.',
      );
      return;
    }

    navigation.navigate(
      'Payment',
      {
        bookingId: booking.id,
        amount: booking.amount,
      },
    );
  };

  // ==========================================
  // STATUS STYLE
  // ==========================================

  const getStatusStyle = status => {
    switch (status) {
      case 'completed':
        return styles.statusCompleted;

      case 'started':
      case 'active':
        return styles.statusActive;

      case 'confirmed':
      case 'accepted':
        return styles.statusConfirmed;

      case 'cancelled':
        return styles.statusCancelled;

      case 'pending':
        return styles.statusPending;

      default:
        return styles.statusDefault;
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#050711"
        />

        <View style={styles.loadingContainer}>
          <View style={styles.loadingIcon}>
            <Text style={styles.loadingIconText}>
              🚗
            </Text>
          </View>

          <ActivityIndicator
            size="small"
            color="#A855F7"
          />

          <Text style={styles.loadingTitle}>
            Loading your bookings
          </Text>

          <Text style={styles.loadingSubtitle}>
            Just a moment...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#050711"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              fetchBookings(true)
            }
            tintColor="#A855F7"
            colors={['#A855F7']}
          />
        }>

        {/* HEADER */}

        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>
              YOUR JOURNEYS
            </Text>

            <Text style={styles.title}>
              My Bookings
            </Text>

            <Text style={styles.subtitle}>
              Keep track of your upcoming and past rides.
            </Text>
          </View>

          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>
              {bookings.length}
            </Text>
          </View>
        </View>

        {/* ERROR */}

        {error ? (
          <View style={styles.errorCard}>
            <View style={styles.errorIcon}>
              <Text style={styles.errorIconText}>
                !
              </Text>
            </View>

            <View style={styles.errorContent}>
              <Text style={styles.errorTitle}>
                Couldn't load bookings
              </Text>

              <Text style={styles.errorText}>
                {error}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  fetchBookings()
                }>
                <Text style={styles.retryText}>
                  Try again
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* EMPTY */}

        {!error &&
        bookings.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>
                🚗
              </Text>
            </View>

            <Text style={styles.emptyTitle}>
              No bookings yet
            </Text>

            <Text style={styles.emptySubtitle}>
              Find a ride and your bookings
              will appear here.
            </Text>

            <TouchableOpacity
              style={styles.emptyButton}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate('FindRide')
              }>

              <Text
                style={styles.emptyButtonText}>
                Find a Ride
              </Text>

              <Text
                style={styles.emptyButtonArrow}>
                →
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* BOOKINGS */}

        {bookings.map(booking => {
          const status =
            getStatus(booking);

          const paymentStatus =
            getPaymentStatus(booking);

          const rideId =
            getRideId(booking);

          const paymentRequired =
            needsPayment(booking);

          const cashPayment =
            isCashPayment(booking);

          const showChat =
            canChat(booking);

          const showTracking =
            canTrack(booking) &&
            !!rideId;

          const showCancel =
            canCancel(booking);

          const statusStyle =
            getStatusStyle(status);

          return (
            <View
              key={String(booking.id)}
              style={styles.bookingCard}>

              {/* TOP */}

              <View style={styles.cardTop}>
                <View style={styles.rideIcon}>
                  <Text
                    style={styles.rideIconText}>
                    🚗
                  </Text>
                </View>

                <View style={styles.rideInfo}>
                  <Text
                    style={styles.rideTitle}
                    numberOfLines={2}>
                    {getRideTitle(booking)}
                  </Text>

                  <Text style={styles.bookingId}>
                    Booking #{booking.id}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    statusStyle,
                  ]}>

                  <Text
                    style={[
                      styles.statusBadgeText,
                      status === 'completed' &&
                        styles.statusTextCompleted,
                      status === 'cancelled' &&
                        styles.statusTextCancelled,
                    ]}>

                    {status.toUpperCase()}

                  </Text>
                </View>
              </View>

              {/* DIVIDER */}

              <View
                style={styles.cardDivider}
              />

              {/* DETAILS */}

              <View
                style={styles.detailsRow}>

                <View
                  style={styles.detailItem}>

                  <Text
                    style={styles.detailLabel}>
                    AMOUNT
                  </Text>

                  <Text
                    style={styles.detailValue}>
                    ₹{booking.amount ?? 0}
                  </Text>
                </View>

                <View
                  style={styles.detailDivider}
                />

                <View
                  style={styles.detailItem}>

                  <Text
                    style={styles.detailLabel}>
                    PAYMENT
                  </Text>

                  <Text
                    style={styles.detailValue}>

                    {cashPayment
                      ? 'CASH'
                      : paymentStatus.toUpperCase()}

                  </Text>
                </View>
              </View>

              {/* COD */}

              {cashPayment ? (
                <View
                  style={styles.infoMessage}>

                  <Text
                    style={
                      styles.infoMessageIcon
                    }>
                    💵
                  </Text>

                  <Text
                    style={
                      styles.infoMessageText
                    }>
                    Cash payment selected. No
                    online payment is required.
                    Waiting for driver confirmation.
                  </Text>
                </View>
              ) : null}

              {/* PAYMENT REQUIRED */}

              {paymentRequired ? (
                <View
                  style={styles.paymentWarning}>

                  <Text
                    style={
                      styles.paymentWarningIcon
                    }>
                    !
                  </Text>

                  <View
                    style={
                      styles.paymentWarningContent
                    }>

                    <Text
                      style={
                        styles.paymentWarningTitle
                      }>
                      Payment required
                    </Text>

                    <Text
                      style={
                        styles.paymentWarningText
                      }>
                      Complete payment now so
                      the driver can accept your
                      booking.
                    </Text>

                  </View>
                </View>
              ) : null}

              {/* CONFIRMED */}

              {status === 'confirmed' ? (
                <View
                  style={styles.infoMessage}>

                  <Text
                    style={
                      styles.infoMessageIcon
                    }>
                    ✓
                  </Text>

                  <Text
                    style={
                      styles.infoMessageText
                    }>
                    Payment completed. Waiting
                    for driver acceptance.
                  </Text>
                </View>
              ) : null}

              {/* ACCEPTED */}

              {status === 'accepted' ? (
                <View
                  style={styles.infoMessage}>

                  <Text
                    style={
                      styles.infoMessageIcon
                    }>
                    ✓
                  </Text>

                  <Text
                    style={
                      styles.infoMessageText
                    }>
                    Driver accepted your ride.
                    Chat is now available.
                  </Text>
                </View>
              ) : null}

              {/* STARTED */}

              {status === 'started' ||
              status === 'active' ? (
                <View
                  style={
                    styles.activeMessage
                  }>

                  <Text
                    style={
                      styles.activeMessageIcon
                    }>
                    ●
                  </Text>

                  <Text
                    style={
                      styles.activeMessageText
                    }>
                    Your ride is active — live
                    tracking is available.
                  </Text>
                </View>
              ) : null}

              {/* COMPLETED */}

              {status === 'completed' ? (
                <View
                  style={
                    styles.completedMessage
                  }>

                  <Text
                    style={
                      styles.completedMessageText
                    }>
                    ✓ Ride completed
                  </Text>
                </View>
              ) : null}

              {/* ACTIONS */}

              <View style={styles.actions}>

                {/* PAY */}

                {paymentRequired &&
                !cashPayment ? (
                  <TouchableOpacity
                    style={styles.payButton}
                    activeOpacity={0.85}
                    onPress={() =>
                      handlePayment(
                        booking,
                      )
                    }>

                    <Text
                      style={
                        styles.payButtonText
                      }>
                      Pay ₹{booking.amount ?? 0}
                    </Text>

                    <Text
                      style={
                        styles.actionArrow
                      }>
                      →
                    </Text>
                  </TouchableOpacity>
                ) : null}

                {/* CHAT */}

                {showChat ? (
                  <TouchableOpacity
                    style={
                      styles.secondaryButton
                    }
                    activeOpacity={0.85}
                    onPress={() =>
                      handleChat(booking)
                    }>

                    <Text
                      style={
                        styles.secondaryIcon
                      }>
                      💬
                    </Text>

                    <Text
                      style={
                        styles.secondaryButtonText
                      }>
                      Chat
                    </Text>
                  </TouchableOpacity>
                ) : null}

                {/* TRACK */}

                {showTracking ? (
                  <TouchableOpacity
                    style={
                      styles.secondaryButton
                    }
                    activeOpacity={0.85}
                    onPress={() =>
                      navigation.navigate('RideTracking', {
                        booking,
                        rideId,
                      })
                    }>

                    <Text
                      style={
                        styles.secondaryIcon
                      }>
                      📍
                    </Text>

                    <Text
                      style={
                        styles.secondaryButtonText
                      }>
                      Track
                    </Text>
                  </TouchableOpacity>
                ) : null}

                {/* DETAILS */}

                <TouchableOpacity
                  style={
                    styles.secondaryButton
                  }
                  activeOpacity={0.85}
                  onPress={() =>
                    handleDetails(booking)
                  }>

                  <Text
                    style={
                      styles.secondaryButtonText
                    }>
                    Details
                  </Text>
                </TouchableOpacity>

              </View>

              {/* CANCEL */}

              {showCancel ? (
                <TouchableOpacity
                  style={
                    styles.cancelButton
                  }
                  disabled={
                    cancellingId ===
                    booking.id
                  }
                  onPress={() =>
                    handleCancel(
                      booking.id,
                    )
                  }>

                  {cancellingId ===
                  booking.id ? (
                    <ActivityIndicator
                      size="small"
                      color="#F87171"
                    />
                  ) : (
                    <Text
                      style={
                        styles.cancelText
                      }>
                      Cancel booking
                    </Text>
                  )}

                </TouchableOpacity>
              ) : null}

            </View>
          );
        })}

        <Text style={styles.footer}>
          GO4RYDE • Travel smarter together
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
};

export default MyBookingsScreen;