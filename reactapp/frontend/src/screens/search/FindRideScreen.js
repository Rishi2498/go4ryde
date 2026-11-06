import React, {useCallback, useEffect, useState} from 'react';

import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import LocationPicker from '../../components/LocationPicker/LocationPicker';
import styles from '../../styles/FindRideScreen.styles';

import {getRides} from '../../services/rideService';

const PAST_SEARCHES_KEY = 'go4ryde_past_searches';

const FindRideScreen = ({navigation}) => {
  const [rideType, setRideType] = useState('all');
  const [passengers, setPassengers] = useState(1);
  const [travelDate, setTravelDate] = useState(new Date());

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);

  const [pastSearches, setPastSearches] = useState([]);

  const [refreshing, setRefreshing] = useState(false);
  const [searching, setSearching] = useState(false);

  // =====================================================
  // LOAD PAST SEARCHES
  // =====================================================

  const loadPastSearches = async () => {
    try {
      const saved = await AsyncStorage.getItem(PAST_SEARCHES_KEY);

      if (!saved) {
        setPastSearches([]);
        return;
      }

      const parsed = JSON.parse(saved);

      setPastSearches(
        Array.isArray(parsed) ? parsed.slice(0, 5) : [],
      );
    } catch (error) {
      console.log('❌ LOAD PAST SEARCHES ERROR:', error);
      setPastSearches([]);
    }
  };

  useEffect(() => {
    loadPastSearches();
  }, []);

  // =====================================================
  // SAVE SEARCH
  // =====================================================

  const savePastSearch = async search => {
    try {
      const saved = await AsyncStorage.getItem(PAST_SEARCHES_KEY);

      const existing = saved ? JSON.parse(saved) : [];

      const safeExisting = Array.isArray(existing)
        ? existing
        : [];

      // Remove duplicate route
      const filtered = safeExisting.filter(item => {
        return !(
          item?.source?.name === search?.source?.name &&
          item?.destination?.name ===
            search?.destination?.name
        );
      });

      const updated = [search, ...filtered].slice(0, 5);

      await AsyncStorage.setItem(
        PAST_SEARCHES_KEY,
        JSON.stringify(updated),
      );

      setPastSearches(updated);
    } catch (error) {
      console.log('❌ SAVE PAST SEARCH ERROR:', error);
    }
  };

  // =====================================================
  // SELECT PAST SEARCH
  // =====================================================

  const handlePastSearchPress = search => {
    if (search?.source) {
      setSource(search.source);
    }

    if (search?.destination) {
      setDestination(search.destination);
    }

    // Date intentionally NOT restored.
    // User can choose a new date.

    // Passengers intentionally NOT restored.
    // User can choose a new passenger count.

    // Ride type intentionally NOT restored.
    // User can choose a different ride type.

    console.log('📍 PAST SEARCH SELECTED:', search);
  };

  // =====================================================
  // BACKEND REFRESH
  // =====================================================

  const refreshFindRide = async () => {
    try {
      console.log('🔄 Loading rides from backend...');

      await getRides();

      await loadPastSearches();
    } catch (error) {
      console.log('❌ FIND RIDE REFRESH ERROR:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      refreshFindRide();
    }, []),
  );

  const handleRefresh = async () => {
    setRefreshing(true);

    await refreshFindRide();

    setRefreshing(false);
  };

  // =====================================================
  // DATE
  // =====================================================

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);

    if (selectedDate) {
      setTravelDate(selectedDate);
    }
  };

  const formatDate = date => {
    return date.toLocaleDateString([], {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // =====================================================
  // PASSENGERS
  // =====================================================

  const increasePassengers = () => {
    if (passengers < 8) {
      setPassengers(prev => prev + 1);
    }
  };

  const decreasePassengers = () => {
    if (passengers > 1) {
      setPassengers(prev => prev - 1);
    }
  };

  // =====================================================
  // SEARCH RIDES
  // =====================================================

  const handleSearch = async () => {
    if (!source) {
      Alert.alert(
        'Pickup required',
        'Please select your pickup location.',
      );
      return;
    }

    if (!destination) {
      Alert.alert(
        'Destination required',
        'Please select your destination.',
      );
      return;
    }

    const searchData = {
      source: {
        name: source.name,
        latitude: source.latitude,
        longitude: source.longitude,
      },

      destination: {
        name: destination.name,
        latitude: destination.latitude,
        longitude: destination.longitude,
      },

      passengers,
      rideType,
    };

    console.log('🔎 SEARCH DATA:', searchData);

    try {
      setSearching(true);

      // Confirm backend is reachable.
      const rides = await getRides();

      console.log(
        '🚗 BACKEND RIDES AVAILABLE:',
        rides.length,
      );

      // Save only the route.
      // Date/passengers/ride type remain editable.
      await savePastSearch(searchData);

      // Navigate to separate Available Rides page.
      navigation.navigate('SearchScreen', {
        source,
        destination,
        passengers,
        rideType,
        travelDate: travelDate.toISOString(),
      });
    } catch (error) {
      console.log('❌ SEARCH RIDES ERROR:', error);

      Alert.alert(
        'Search failed',
        error?.message ||
          'Unable to load rides from the server.',
      );
    } finally {
      setSearching(false);
    }
  };

  // =====================================================
  // RENDER PAST SEARCH
  // =====================================================

  const renderPastSearch = (search, index) => {
    return (
      <TouchableOpacity
        key={`${search?.source?.name}-${search?.destination?.name}-${index}`}
        style={styles.pastSearchCard}
        activeOpacity={0.85}
        onPress={() => handlePastSearchPress(search)}>

        <View style={styles.pastRouteContainer}>

          {/* FROM / TO DOTS */}
          <View style={styles.pastRouteColumn}>
            <View style={styles.pastSourceDot} />

            <View style={styles.pastRouteLine} />

            <View style={styles.pastDestinationDot} />
          </View>

          {/* LOCATIONS */}
          <View style={styles.pastLocations}>

            <View style={styles.pastLocationBlock}>
              <Text style={styles.pastLocationLabel}>
                FROM
              </Text>

              <Text
                style={styles.pastLocationText}
                numberOfLines={2}>
                {search?.source?.name || 'Pickup'}
              </Text>
            </View>

            <View style={styles.pastRouteGap} />

            <View style={styles.pastLocationBlock}>
              <Text style={styles.pastLocationLabel}>
                TO
              </Text>

              <Text
                style={styles.pastLocationText}
                numberOfLines={2}>
                {search?.destination?.name || 'Destination'}
              </Text>
            </View>
          </View>

          {/* ARROW */}
          <View style={styles.pastSearchArrowContainer}>
            <Text style={styles.pastSearchArrow}>
              ›
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F4F6F8"
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
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
            onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>
              ‹
            </Text>
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>
              Find a Ride
            </Text>

            <Text style={styles.subtitle}>
              Choose your route and find a ride
            </Text>
          </View>
        </View>

        {/* LOCATION FORM */}
        <LocationPicker
          source={source}
          destination={destination}
          onSourceChange={setSource}
          onDestinationChange={setDestination}
        />

        {/* DATE */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>
            DATE
          </Text>

          <TouchableOpacity
            style={styles.dateButton}
            activeOpacity={0.8}
            onPress={() => setShowDatePicker(true)}>

            <View>
              <Text style={styles.dateTitle}>
                {formatDate(travelDate)}
              </Text>

              <Text style={styles.dateSubtitle}>
                Choose your travel date
              </Text>
            </View>

            <Text style={styles.dateArrow}>
              ›
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={travelDate}
            mode="date"
            minimumDate={new Date()}
            onChange={handleDateChange}
          />
        )}

        {/* PASSENGERS */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>
            PASSENGERS
          </Text>

          <View style={styles.passengerRow}>

            <View>
              <Text style={styles.passengerTitle}>
                Passengers
              </Text>

              <Text style={styles.passengerSubtitle}>
                Number of seats needed
              </Text>
            </View>

            <View style={styles.counterContainer}>

              <TouchableOpacity
                style={styles.counterButton}
                onPress={decreasePassengers}
                disabled={passengers <= 1}>

                <Text
                  style={[
                    styles.counterButtonText,
                    passengers <= 1 &&
                      styles.counterDisabled,
                  ]}>
                  −
                </Text>
              </TouchableOpacity>

              <Text style={styles.passengerCount}>
                {passengers}
              </Text>

              <TouchableOpacity
                style={styles.counterButton}
                onPress={increasePassengers}
                disabled={passengers >= 8}>

                <Text
                  style={[
                    styles.counterButtonText,
                    passengers >= 8 &&
                      styles.counterDisabled,
                  ]}>
                  +
                </Text>
              </TouchableOpacity>

            </View>
          </View>
        </View>

        {/* RIDE TYPE */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>
            RIDE TYPE
          </Text>

          <View style={styles.rideTypeRow}>

            <TouchableOpacity
              style={[
                styles.rideTypeButton,
                rideType === 'all' &&
                  styles.rideTypeButtonActive,
              ]}
              onPress={() => setRideType('all')}>

              <Text
                style={[
                  styles.rideTypeText,
                  rideType === 'all' &&
                    styles.rideTypeTextActive,
                ]}>
                All
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.rideTypeButton,
                rideType === 'car' &&
                  styles.rideTypeButtonActive,
              ]}
              onPress={() => setRideType('car')}>

              <Text
                style={[
                  styles.rideTypeText,
                  rideType === 'car' &&
                    styles.rideTypeTextActive,
                ]}>
                Car
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.rideTypeButton,
                rideType === 'bike' &&
                  styles.rideTypeButtonActive,
              ]}
              onPress={() => setRideType('bike')}>

              <Text
                style={[
                  styles.rideTypeText,
                  rideType === 'bike' &&
                    styles.rideTypeTextActive,
                ]}>
                Bike
              </Text>
            </TouchableOpacity>

          </View>
        </View>

        {/* SEARCH BUTTON */}
        <TouchableOpacity
          style={[
            styles.searchButton,
            searching && styles.searchButtonDisabled,
          ]}
          activeOpacity={0.85}
          disabled={searching}
          onPress={handleSearch}>

          <Text style={styles.searchButtonText}>
            {searching
              ? 'Finding Rides...'
              : 'Search Rides'}
          </Text>

          {!searching && (
            <Text style={styles.searchButtonArrow}>
              →
            </Text>
          )}
        </TouchableOpacity>

        {/* PAST SEARCHES */}
        {pastSearches.length > 0 && (
          <View style={styles.pastSearchesSection}>

            <View style={styles.pastSearchesHeader}>
              <View>
                <Text style={styles.pastSearchesTitle}>
                  Recent Searches
                </Text>

                <Text style={styles.pastSearchesSubtitle}>
                  Tap a route to use it again
                </Text>
              </View>

              <Text style={styles.pastSearchesCount}>
                {pastSearches.length}
              </Text>
            </View>

            {pastSearches.map(renderPastSearch)}

          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

export default FindRideScreen;