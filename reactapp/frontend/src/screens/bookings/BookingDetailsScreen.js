import React from 'react';

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import styles from '../../styles/BookingDetailsScreen.styles';

const BookingDetailsScreen = ({
  navigation,
  route,
}) => {
  const {booking} = route?.params || {};

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#050711"
        />

        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>
            Booking unavailable
          </Text>

          <Text style={styles.errorText}>
            Booking details could not be loaded.
          </Text>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              navigation.goBack()
            }>

            <Text style={styles.backButtonText}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const status = String(
    booking?.status || 'PENDING',
  ).toUpperCase();

  const paymentStatus = String(
    booking?.payment_status || 'PENDING',
  ).toUpperCase();

  const paymentType = String(
    booking?.payment_type || '',
  ).toUpperCase();

  const isCash =
    paymentType === 'COD';

  const rideTitle =
    typeof booking?.ride === 'string'
      ? booking.ride
      : booking?.source &&
        booking?.destination
      ? `${booking.source} → ${booking.destination}`
      : booking?.ride?.source &&
        booking?.ride?.destination
      ? `${booking.ride.source} → ${booking.ride.destination}`
      : 'Your Ride';

  const driverName =
    booking?.driver_name ||
    booking?.ride?.driver_name ||
    'Not available';

  const driverPhone =
    booking?.driver_phone ||
    booking?.ride?.driver_phone ||
    'Not available';

  const seats =
    booking?.seats ||
    booking?.seat_count ||
    1;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#050711"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>

        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              navigation.goBack()
            }>

            <Text style={styles.backText}>
              ‹ Back
            </Text>
          </TouchableOpacity>

          <Text style={styles.eyebrow}>
            BOOKING DETAILS
          </Text>

          <Text style={styles.title}>
            Your Ride
          </Text>

          <Text style={styles.bookingNumber}>
            Booking #{booking.id}
          </Text>
        </View>

        {/* STATUS */}

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>
            BOOKING STATUS
          </Text>

          <View style={styles.statusRow}>
            <Text style={styles.statusValue}>
              {status}
            </Text>

            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>
                {status}
              </Text>
            </View>
          </View>
        </View>

        {/* ROUTE */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            RIDE
          </Text>

          <Text style={styles.routeTitle}>
            {rideTitle}
          </Text>

          {booking?.source ? (
            <View style={styles.locationBlock}>
              <Text style={styles.locationLabel}>
                FROM
              </Text>

              <Text style={styles.locationText}>
                {booking.source}
              </Text>
            </View>
          ) : null}

          {booking?.destination ? (
            <View style={styles.locationBlock}>
              <Text style={styles.locationLabel}>
                TO
              </Text>

              <Text style={styles.locationText}>
                {booking.destination}
              </Text>
            </View>
          ) : null}
        </View>

        {/* DRIVER */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            DRIVER
          </Text>

          <View style={styles.driverRow}>
            <View style={styles.driverAvatar}>
              <Text style={styles.driverAvatarText}>
                {String(driverName)
                  .charAt(0)
                  .toUpperCase()}
              </Text>
            </View>

            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>
                {driverName}
              </Text>

              <Text style={styles.driverPhone}>
                {driverPhone}
              </Text>
            </View>
          </View>
        </View>

        {/* BOOKING INFORMATION */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            BOOKING INFORMATION
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Seats
            </Text>

            <Text style={styles.infoValue}>
              {seats}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Amount
            </Text>

            <Text style={styles.infoValue}>
              ₹{booking?.amount ?? 0}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Payment type
            </Text>

            <Text style={styles.infoValue}>
              {isCash
                ? 'CASH / COD'
                : paymentType || 'ONLINE'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Payment status
            </Text>

            <Text style={styles.infoValue}>
              {isCash
                ? 'CASH SELECTED'
                : paymentStatus}
            </Text>
          </View>
        </View>

        {/* CHAT */}

        {[
          'ACCEPTED',
          'STARTED',
          'ACTIVE',
        ].includes(status) ? (
          <TouchableOpacity
            style={styles.chatButton}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate(
                'Chat',
                {
                  bookingId: booking.id,
                  rideId:
                    booking?.ride_id ||
                    booking?.ride?.id,
                },
              )
            }>

            <Text style={styles.chatIcon}>
              💬
            </Text>

            <View style={styles.chatTextWrap}>
              <Text style={styles.chatTitle}>
                Open Chat
              </Text>

              <Text style={styles.chatSubtitle}>
                Chat with your driver
              </Text>
            </View>

            <Text style={styles.chatArrow}>
              →
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.waitingCard}>
            <Text style={styles.waitingIcon}>
              ⏳
            </Text>

            <View style={styles.waitingTextWrap}>
              <Text style={styles.waitingTitle}>
                Chat not available yet
              </Text>

              <Text style={styles.waitingText}>
                Chat becomes available after the
                driver accepts your booking.
              </Text>
            </View>
          </View>
        )}

        {/* BACK */}

        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() =>
            navigation.goBack()
          }>

          <Text style={styles.bottomButtonText}>
            Back to My Bookings
          </Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          GO4RYDE • Travel smarter together
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
};

export default BookingDetailsScreen;
