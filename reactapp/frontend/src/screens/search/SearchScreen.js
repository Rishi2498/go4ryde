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

import {getRides} from '../../services/rideService';
import styles from '../../styles/SearchScreen.styles';

const SearchScreen = ({route, navigation}) => {
  const {
    source,
    destination,
    passengers = 1,
    rideType = 'all',
    travelDate,
  } = route?.params || {};

  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // =====================================================
  // LOAD RIDES
  // =====================================================

  const loadRides = async () => {
    try {
      setLoading(true);

      console.log('🔎 LOADING AVAILABLE RIDES...');

      const data = await getRides();

      console.log('🚗 RIDES FROM BACKEND:', data);

      setRides(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log('❌ SEARCH SCREEN ERROR:', error);

      Alert.alert(
        'Unable to load rides',
        error?.message ||
          'Unable to connect to the server.',
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRides();
    }, []),
  );

  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = async () => {
    setRefreshing(true);

    await loadRides();

    setRefreshing(false);
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatRideDate = date => {
    if (!date) {
      return 'Time unavailable';
    }

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return String(date);
    }

    return value.toLocaleString([], {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // =====================================================
  // DRIVER NAME
  // =====================================================

  const getDriverName = ride => {
    return (
      ride?.driver?.name ||
      ride?.driver?.full_name ||
      ride?.driver?.username ||
      ride?.driver?.email ||
      'Driver'
    );
  };

  // =====================================================
  // BOOK RIDE
  // =====================================================

 const handleBookRide = ride => {
  navigation.navigate('RideDetails', {
    ride,
    passengers,
  });
};

  // =====================================================
  // RIDE CARD
  // =====================================================

  const renderRideCard = ride => {
    const driverName = getDriverName(ride);

    const avatarLetter =
      driverName?.charAt(0)?.toUpperCase() || 'D';

    return (
      <View
        key={ride.id}
        style={styles.rideCard}>

        {/* DRIVER + PRICE */}
        <View style={styles.topRow}>

          <View style={styles.driverAvatar}>
            <Text style={styles.driverAvatarText}>
              {avatarLetter}
            </Text>
          </View>

          <View style={styles.driverInfo}>
            <Text
              style={styles.driverName}
              numberOfLines={1}>
              {driverName}
            </Text>

            <Text style={styles.rideDate}>
              {formatRideDate(ride.date_time)}
            </Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>
              PRICE
            </Text>

            <Text style={styles.ridePrice}>
              ₹{ride.price_per_seat ?? '--'}
            </Text>

            <Text style={styles.perSeat}>
              per seat
            </Text>
          </View>

        </View>

        {/* ROUTE */}
        <View style={styles.routeContainer}>

          <View style={styles.routeDots}>

            <View style={styles.sourceDot} />

            <View style={styles.routeLine} />

            <View style={styles.destinationDot} />

          </View>

          <View style={styles.locations}>

            <Text style={styles.locationLabel}>
              FROM
            </Text>

            <Text
              style={styles.location}
              numberOfLines={2}>
              {ride.source}
            </Text>

            <View style={styles.routeGap} />

            <Text style={styles.locationLabel}>
              TO
            </Text>

            <Text
              style={styles.location}
              numberOfLines={2}>
              {ride.destination}
            </Text>

          </View>

        </View>

        {/* RIDE INFORMATION */}
        <View style={styles.infoRow}>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>
              SEATS
            </Text>

            <Text style={styles.infoValue}>
              {ride.seats_remaining ?? 0}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>
              DISTANCE
            </Text>

            <Text style={styles.infoValue}>
              {ride.distance_km
                ? `${ride.distance_km} km`
                : '--'}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>
              DURATION
            </Text>

            <Text style={styles.infoValue}>
              {ride.duration_min
                ? `${ride.duration_min} min`
                : '--'}
            </Text>
          </View>

        </View>

        {/* BOOK */}
        <TouchableOpacity
          style={styles.bookButton}
          activeOpacity={0.85}
          onPress={() => handleBookRide(ride)}>

          <Text style={styles.bookButtonText}>
            View & Book
          </Text>

        </TouchableOpacity>

      </View>
    );
  };

  // =====================================================
  // SCREEN
  // =====================================================

  return (
    <SafeAreaView style={styles.container}>

      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F4F6F8"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }>

        {/* HEADER */}
        <View style={styles.header}>

          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}>

            <Text style={styles.backButtonText}>
              ‹
            </Text>

          </TouchableOpacity>

          <View style={styles.headerTextContainer}>

            <Text style={styles.title}>
              Available Rides
            </Text>

            <Text style={styles.subtitle}>
              Choose the ride that works for you
            </Text>

          </View>

        </View>

        {/* SEARCH SUMMARY */}
        <View style={styles.searchSummary}>

          <Text style={styles.summaryLabel}>
            YOUR SEARCH
          </Text>

          <View style={styles.summaryRoute}>

            <View style={styles.summaryDot} />

            <Text
              style={styles.summaryLocation}
              numberOfLines={2}>
              {source?.name || 'Pickup location'}
            </Text>

          </View>

          <View style={styles.summaryLine} />

          <View style={styles.summaryRoute}>

            <View style={styles.summaryDestinationDot} />

            <Text
              style={styles.summaryLocation}
              numberOfLines={2}>
              {destination?.name || 'Destination'}
            </Text>

          </View>

          <View style={styles.summaryDetails}>

            <Text style={styles.summaryDetail}>
              {passengers}{' '}
              {passengers === 1
                ? 'Passenger'
                : 'Passengers'}
            </Text>

            <Text style={styles.summarySeparator}>
              •
            </Text>

            <Text style={styles.summaryDetail}>
              {rideType === 'all'
                ? 'All rides'
                : rideType === 'car'
                  ? 'Car'
                  : 'Bike'}
            </Text>

            {travelDate && (
              <>
                <Text style={styles.summarySeparator}>
                  •
                </Text>

                <Text style={styles.summaryDetail}>
                  {formatRideDate(travelDate)}
                </Text>
              </>
            )}

          </View>

        </View>

        {/* RESULTS HEADER */}
        <View style={styles.resultsHeader}>

          <Text style={styles.resultsTitle}>
            Available rides
          </Text>

          {!loading && (
            <Text style={styles.resultsCount}>
              {rides.length}{' '}
              {rides.length === 1
                ? 'ride'
                : 'rides'}
            </Text>
          )}

        </View>

        {/* LOADING */}
        {loading ? (
          <View style={styles.loadingContainer}>

            <ActivityIndicator
              size="small"
              color="#16384A"
            />

            <Text style={styles.loadingText}>
              Finding available rides...
            </Text>

          </View>
        ) : rides.length > 0 ? (

          rides.map(renderRideCard)

        ) : (

          <View style={styles.emptyContainer}>

            <Text style={styles.emptyIcon}>
              ⌕
            </Text>

            <Text style={styles.emptyTitle}>
              No rides found
            </Text>

            <Text style={styles.emptyText}>
              No rides are currently available for
              this route.
            </Text>

            <TouchableOpacity
              style={styles.changeSearchButton}
              activeOpacity={0.85}
              onPress={() => navigation.goBack()}>

              <Text style={styles.changeSearchButtonText}>
                Change Search
              </Text>

            </TouchableOpacity>

          </View>
        )}

      </ScrollView>

    </SafeAreaView>
  );
};

export default SearchScreen;