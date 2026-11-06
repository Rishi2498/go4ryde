import React, {useCallback, useState} from 'react';

import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';

import {useFocusEffect} from '@react-navigation/native';

import {getMyRides} from '../../services/rideService';

import styles from '../../styles/MyRidesScreen.styles';

const MyRidesScreen = ({navigation}) => {
  console.log('🔥 MY RIDES SCREEN OPENED');

  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // =====================================================
  // LOAD DRIVER RIDES
  // =====================================================

  const loadMyRides = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      const response = await getMyRides();

      // console.log(
      //   '🚗 MY RIDES RESPONSE:',
      //   JSON.stringify(response, null, 2),
      // );

      const ridesData = Array.isArray(response)
        ? response
        : Array.isArray(response?.results)
        ? response.results
        : Array.isArray(response?.data)
        ? response.data
        : [];

      // console.log(
      //   '🚗 NORMALIZED MY RIDES:',
      //   JSON.stringify(ridesData, null, 2),
      // );

      setRides(ridesData);
    } catch (err) {
      console.log('❌ MY RIDES ERROR:', err);

      setError(
        err?.data?.error ||
          err?.data?.detail ||
          err?.message ||
          'Unable to load your rides.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =====================================================
  // LOAD WHEN SCREEN OPENS
  // =====================================================

  useFocusEffect(
    useCallback(() => {
      loadMyRides();

      return undefined;
    }, []),
  );

  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = () => {
    loadMyRides(true);
  };

  // =====================================================
  // STATUS
  // =====================================================

  const getStatusLabel = status => {
    if (!status) {
      return 'UNKNOWN';
    }

    return String(status).toUpperCase();
  };

  // =====================================================
  // STATUS STYLE
  // =====================================================

  const getStatusStyle = status => {
    const value = String(status || '').toUpperCase();

    if (value === 'COMPLETED') {
      return styles.completedStatusBadge;
    }

    if (value === 'ACTIVE') {
      return styles.activeStatusBadge;
    }

    if (value === 'SCHEDULED') {
      return styles.scheduledStatusBadge;
    }

    return styles.defaultStatusBadge;
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.center}>
          <ActivityIndicator size="large" />

          <Text style={styles.loadingText}>
            Loading your rides...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }>

        {/* =================================================
            HEADER
        ================================================= */}

        <View style={styles.header}>
          <Text style={styles.eyebrow}>
            DRIVER
          </Text>

          <Text style={styles.title}>
            My Rides
          </Text>

          <Text style={styles.subtitle}>
            View and manage the rides you have offered.
          </Text>
        </View>

        {/* =================================================
            ERROR
        ================================================= */}

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              {error}
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => loadMyRides()}>

              <Text style={styles.retryText}>
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!error && rides.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>
              🚗
            </Text>

            <Text style={styles.emptyTitle}>
              No rides yet
            </Text>

            <Text style={styles.emptyText}>
              Create a ride to start receiving passenger
              booking requests.
            </Text>

            <TouchableOpacity
              style={styles.createButton}
              onPress={() =>
                navigation.navigate('CreateRide')
              }>

              <Text style={styles.createButtonText}>
                Offer a Ride
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* =================================================
            RIDE LIST
        ================================================= */}

        {rides.map(ride => {
          const status = getStatusLabel(ride.status);

          return (
            <View
              key={String(ride.id)}
              style={styles.rideCard}>

              {/* =================================================
                  ROUTE
              ================================================= */}

              <View style={styles.routeSection}>
                <View style={styles.routePoint}>
                  <View style={styles.fromDot} />

                  <View style={styles.routeTextContainer}>
                    <Text style={styles.routeLabel}>
                      FROM
                    </Text>

                    <Text style={styles.route}>
                      {ride.source || 'Not available'}
                    </Text>
                  </View>
                </View>

                <View style={styles.routeLine} />

                <View style={styles.routePoint}>
                  <View style={styles.toDot} />

                  <View style={styles.routeTextContainer}>
                    <Text style={styles.routeLabel}>
                      TO
                    </Text>

                    <Text style={styles.route}>
                      {ride.destination || 'Not available'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* =================================================
                  STATUS
              ================================================= */}

              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>
                  Ride Status
                </Text>

                <View style={getStatusStyle(status)}>
                  <Text style={styles.statusText}>
                    {status}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* =================================================
                  RIDE INFO
              ================================================= */}

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>
                    Date & Time
                  </Text>

                  <Text style={styles.infoValue}>
                    {ride.date_time || 'Not available'}
                  </Text>
                </View>
              </View>

              <View style={styles.infoGrid}>
                <View style={styles.infoGridItem}>
                  <Text style={styles.infoLabel}>
                    Price / Seat
                  </Text>

                  <Text style={styles.infoValue}>
                    ₹{ride.price_per_seat ?? 0}
                  </Text>
                </View>

                <View style={styles.infoGridItem}>
                  <Text style={styles.infoLabel}>
                    Bookings
                  </Text>

                  <Text style={styles.infoValue}>
                    {ride.bookings_count ?? 0}
                  </Text>
                </View>
              </View>

              {/* =================================================
                  VIEW DETAILS
              ================================================= */}

              <TouchableOpacity
                style={styles.detailsButton}
                activeOpacity={0.8}
                onPress={() =>
                  navigation.navigate(
                    'RideDetails',
                    {
                      rideId: ride.id,
                    },
                  )
                }>

                <Text style={styles.detailsButtonText}>
                  View Ride Details
                </Text>

                <Text style={styles.detailsArrow}>
                  →
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyRidesScreen;