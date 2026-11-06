import React, {useState} from 'react';

import {
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';

import LocationPicker from '../../components/LocationPicker/LocationPicker';
import styles from '../../styles/CreateRideScreen.styles';

import {createRide} from '../../services/rideService';

const CreateRideScreen = ({navigation}) => {
  // =====================================================
  // LOCATION
  // =====================================================

  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);

  // =====================================================
  // DATE + TIME
  // =====================================================

  const [travelDate, setTravelDate] = useState(() => {
    const date = new Date();

    // Default to tomorrow
    date.setDate(date.getDate() + 1);

    // Default time 9:00 AM
    date.setHours(9, 0, 0, 0);

    return date;
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // =====================================================
  // RIDE DETAILS
  // =====================================================

  const [seats, setSeats] = useState(1);
  const [price, setPrice] = useState('');

  const [loading, setLoading] = useState(false);

  // =====================================================
  // DATE
  // =====================================================

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);

    if (!selectedDate) {
      return;
    }

    const updatedDate = new Date(travelDate);

    updatedDate.setFullYear(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
    );

    setTravelDate(updatedDate);
  };

  // =====================================================
  // TIME
  // =====================================================

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);

    if (!selectedTime) {
      return;
    }

    const updatedDate = new Date(travelDate);

    updatedDate.setHours(
      selectedTime.getHours(),
      selectedTime.getMinutes(),
      0,
      0,
    );

    setTravelDate(updatedDate);
  };

  // =====================================================
  // SEATS
  // =====================================================

  const increaseSeats = () => {
    if (seats < 8) {
      setSeats(seats + 1);
    }
  };

  const decreaseSeats = () => {
    if (seats > 1) {
      setSeats(seats - 1);
    }
  };

  // =====================================================
  // CREATE RIDE
  // =====================================================

  const handleCreateRide = async () => {
    console.log('======================================');
    console.log('🚗 CREATE RIDE BUTTON PRESSED');
    console.log('======================================');

    // ---------------------------------------------------
    // LOCATION VALIDATION
    // ---------------------------------------------------

    if (!source) {
      Alert.alert(
        'Pickup Required',
        'Please select your pickup location.',
      );
      return;
    }

    if (!destination) {
      Alert.alert(
        'Destination Required',
        'Please select your destination.',
      );
      return;
    }

    if (
      source.latitude === undefined ||
      source.longitude === undefined
    ) {
      Alert.alert(
        'Invalid Pickup',
        'Please select the pickup location again.',
      );
      return;
    }

    if (
      destination.latitude === undefined ||
      destination.longitude === undefined
    ) {
      Alert.alert(
        'Invalid Destination',
        'Please select the destination again.',
      );
      return;
    }

    // ---------------------------------------------------
    // SAME LOCATION
    // ---------------------------------------------------

    if (
      source.name.trim().toLowerCase() ===
      destination.name.trim().toLowerCase()
    ) {
      Alert.alert(
        'Invalid Route',
        'Pickup and destination cannot be the same.',
      );
      return;
    }

    // ---------------------------------------------------
    // SEATS
    // ---------------------------------------------------

    const seatCount = Number(seats);

    if (!seatCount || seatCount <= 0) {
      Alert.alert(
        'Invalid Seats',
        'Please select at least 1 seat.',
      );
      return;
    }

    // ---------------------------------------------------
    // PRICE
    // ---------------------------------------------------

    const seatPrice = Number(price);

    if (!seatPrice || seatPrice <= 0) {
      Alert.alert(
        'Invalid Price',
        'Please enter a valid price per seat.',
      );
      return;
    }

    // ---------------------------------------------------
    // FUTURE DATE
    // ---------------------------------------------------

    if (travelDate <= new Date()) {
      Alert.alert(
        'Invalid Date',
        'Ride must be scheduled for a future date and time.',
      );
      return;
    }

    // ===================================================
    // EXACT BACKEND PAYLOAD
    // ===================================================

    const rideData = {
      source: source.name.trim(),

      source_lat: Number(source.latitude),

      source_lng: Number(source.longitude),

      destination: destination.name.trim(),

      destination_lat: Number(destination.latitude),

      destination_lng: Number(destination.longitude),

      date_time: travelDate.toISOString(),

      seats_available: seatCount,

      price_per_seat: seatPrice,
    };

    console.log('🚗 SOURCE:', source);
    console.log('📍 DESTINATION:', destination);

    console.log(
      '🚀 FINAL RIDE DATA:',
      JSON.stringify(rideData, null, 2),
    );

    // ===================================================
    // POST /api/rides/
    // ===================================================

    try {
      setLoading(true);

      console.log('🚀 POST /api/rides/');

      const response = await createRide(rideData);

      console.log('✅ RIDE CREATED:', response);

      Alert.alert(
        'Ride Offered',
        'Your ride has been created successfully.',
        [
          {
            text: 'View My Rides',
            onPress: () => {
              navigation.navigate('MyRides');
            },
          },
          {
            text: 'Done',
            onPress: () => {
              navigation.goBack();
            },
          },
        ],
      );
    } catch (error) {
      console.log('❌ CREATE RIDE ERROR:', error);

      Alert.alert(
        'Unable to Offer Ride',
        error?.message ||
          'Unable to create the ride. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DISPLAY VALUES
  // =====================================================

  const formattedDate = travelDate.toLocaleDateString(
    'en-IN',
    {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  );

  const formattedTime = travelDate.toLocaleTimeString(
    'en-IN',
    {
      hour: '2-digit',
      minute: '2-digit',
    },
  );

  // =====================================================
  // UI
  // =====================================================

  return (
    <View style={styles.container}>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}>

        {/* ================================================
            HEADER
        ================================================= */}

        <View style={styles.header}>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>

            <Text style={styles.backText}>
              ‹
            </Text>

          </TouchableOpacity>

          <View>
            <Text style={styles.headerTitle}>
              Offer a Ride
            </Text>

            <Text style={styles.headerSubtitle}>
              Share your journey with passengers
            </Text>
          </View>

        </View>

        {/* ================================================
            JOURNEY
        ================================================= */}

        <View style={styles.card}>

          <Text style={styles.sectionTitle}>
            Your Journey
          </Text>

          <LocationPicker
            source={source}
            destination={destination}

            onSourceChange={location => {
              console.log(
                '📍 SOURCE SELECTED:',
                location,
              );

              setSource(location);
            }}

            onDestinationChange={location => {
              console.log(
                '📍 DESTINATION SELECTED:',
                location,
              );

              setDestination(location);
            }}
          />

        </View>

        {/* ================================================
            DATE + TIME
        ================================================= */}

        <View style={styles.card}>

          <Text style={styles.sectionTitle}>
            Departure
          </Text>

          <View style={styles.selectorRow}>

            <TouchableOpacity
              style={styles.selectorCard}
              onPress={() => setShowDatePicker(true)}>

              <Text style={styles.selectorIcon}>
                📅
              </Text>

              <View style={styles.selectorContent}>

                <Text style={styles.selectorLabel}>
                  DATE
                </Text>

                <Text style={styles.selectorValue}>
                  {formattedDate}
                </Text>

              </View>

            </TouchableOpacity>

            <TouchableOpacity
              style={styles.selectorCard}
              onPress={() => setShowTimePicker(true)}>

              <Text style={styles.selectorIcon}>
                🕐
              </Text>

              <View style={styles.selectorContent}>

                <Text style={styles.selectorLabel}>
                  TIME
                </Text>

                <Text style={styles.selectorValue}>
                  {formattedTime}
                </Text>

              </View>

            </TouchableOpacity>

          </View>

          {showDatePicker && (
            <DateTimePicker
              value={travelDate}
              mode="date"
              minimumDate={new Date()}
              display={
                Platform.OS === 'ios'
                  ? 'spinner'
                  : 'default'
              }
              onChange={handleDateChange}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={travelDate}
              mode="time"
              display={
                Platform.OS === 'ios'
                  ? 'spinner'
                  : 'default'
              }
              onChange={handleTimeChange}
            />
          )}

        </View>

        {/* ================================================
            SEATS
        ================================================= */}

        <View style={styles.card}>

          <Text style={styles.sectionTitle}>
            Available Seats
          </Text>

          <View style={styles.seatRow}>

            <View style={styles.seatInfo}>

              <Text style={styles.seatTitle}>
                Passenger seats
              </Text>

              <Text style={styles.seatSubtitle}>
                Seats available for passengers
              </Text>

            </View>

            <View style={styles.counterContainer}>

              <TouchableOpacity
                style={styles.counterButton}
                onPress={decreaseSeats}>

                <Text style={styles.counterButtonText}>
                  −
                </Text>

              </TouchableOpacity>

              <Text style={styles.counterValue}>
                {seats}
              </Text>

              <TouchableOpacity
                style={styles.counterButton}
                onPress={increaseSeats}>

                <Text style={styles.counterButtonText}>
                  +
                </Text>

              </TouchableOpacity>

            </View>

          </View>

        </View>

        {/* ================================================
            PRICE
        ================================================= */}

        <View style={styles.card}>

          <Text style={styles.sectionTitle}>
            Price
          </Text>

          <Text style={styles.inputLabel}>
            Price per passenger
          </Text>

          <View style={styles.priceContainer}>

            <Text style={styles.currency}>
              ₹
            </Text>

            <TextInput
              value={price}
              onChangeText={setPrice}
              placeholder="Enter price"
              placeholderTextColor="#8A98A2"
              keyboardType="numeric"
              style={styles.priceInput}
              maxLength={7}
            />

            <Text style={styles.perSeat}>
              / seat
            </Text>

          </View>

        </View>

        {/* ================================================
            SUMMARY
        ================================================= */}

        {source && destination && (
          <View style={styles.summaryCard}>

            <Text style={styles.summaryTitle}>
              Ride Summary
            </Text>

            <View style={styles.summaryRow}>

              <Text style={styles.summaryLabel}>
                FROM
              </Text>

              <Text
                style={styles.summaryValue}
                numberOfLines={2}>
                {source.name}
              </Text>

            </View>

            <View style={styles.summaryRow}>

              <Text style={styles.summaryLabel}>
                TO
              </Text>

              <Text
                style={styles.summaryValue}
                numberOfLines={2}>
                {destination.name}
              </Text>

            </View>

            <View style={styles.summaryRow}>

              <Text style={styles.summaryLabel}>
                DATE
              </Text>

              <Text style={styles.summaryValue}>
                {formattedDate}
              </Text>

            </View>

            <View style={styles.summaryRow}>

              <Text style={styles.summaryLabel}>
                TIME
              </Text>

              <Text style={styles.summaryValue}>
                {formattedTime}
              </Text>

            </View>

            <View style={styles.summaryRow}>

              <Text style={styles.summaryLabel}>
                SEATS
              </Text>

              <Text style={styles.summaryValue}>
                {seats}
              </Text>

            </View>

            {price ? (
              <View style={styles.summaryRow}>

                <Text style={styles.summaryLabel}>
                  PRICE
                </Text>

                <Text style={styles.summaryPrice}>
                  ₹{price} / seat
                </Text>

              </View>
            ) : null}

          </View>
        )}

        {/* ================================================
            OFFER RIDE
        ================================================= */}

        <TouchableOpacity
          style={[
            styles.offerButton,
            loading && styles.offerButtonDisabled,
          ]}
          disabled={loading}
          onPress={handleCreateRide}>

          <Text style={styles.offerButtonText}>
            {loading
              ? 'Offering Ride...'
              : 'Offer Ride'}
          </Text>

        </TouchableOpacity>

        <Text style={styles.bottomHint}>
          You can manage passenger requests from My Rides.
        </Text>

      </ScrollView>

    </View>
  );
};

export default CreateRideScreen;