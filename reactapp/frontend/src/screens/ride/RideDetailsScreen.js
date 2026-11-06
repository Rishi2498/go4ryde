import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Geolocation from '@react-native-community/geolocation';
import {updateDriverLocation} from '../../services/trackingService';

import {useFocusEffect} from '@react-navigation/native';

import MapView, {Marker, Polyline} from 'react-native-maps';

import {
  getMyRides,
  acceptBooking,
  rejectBooking,
  startRide,
  endRide,
} from '../../services/rideService';

import {createBooking} from '../../services/bookingService';

import styles from '../../styles/RideDetailsScreen.styles';

// =====================================================
// SCREEN
// =====================================================

const RideDetailsScreen = ({route, navigation}) => {
  const {
    ride: selectedRide,
    passengers = 1,
    rideId,
  } = route?.params || {};

  // ===================================================
  // MODE
  // ===================================================

  const isPassengerMode = !!selectedRide && !rideId;
  const isDriverMode = !!rideId;

  // ===================================================
  // STATE
  // ===================================================
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [ride, setRide] = useState(selectedRide || null);

  const [loading, setLoading] = useState(isDriverMode);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState('');

  const [processingBooking, setProcessingBooking] =
    useState(null);

  const [processingRide, setProcessingRide] =
    useState(null);

  const [bookingLoading, setBookingLoading] =
    useState(false);

  // ===================================================
  // LOAD RIDE
  // ===================================================

  const loadRide = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      // ===============================================
      // PASSENGER MODE
      // ===============================================

      // if (selectedRide && !rideId) {
      //   console.log(
      //     '🚗 USING SELECTED PASSENGER RIDE:',
      //     JSON.stringify(selectedRide, null, 2),
      //   );

      //   setRide(selectedRide);

      //   return;
      // }

      // ===============================================
      // DRIVER MODE
      // ===============================================

      if (rideId) {
        // console.log(
        //   '🚗 LOADING DRIVER RIDE:',
        //   rideId,
        // );

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

        const foundRide = ridesData.find(
          item =>
            String(item?.id) === String(rideId),
        );

        // console.log(
        //   '🚗 FOUND DRIVER RIDE:',
        //   JSON.stringify(foundRide, null, 2),
        // );

        if (!foundRide) {
          setRide(null);
          setError('Ride could not be found.');
          return;
        }

        setRide(foundRide);

const hasStartedBooking = Array.isArray(foundRide.booked_users)
  && foundRide.booked_users.some(
    booking =>
      String(booking?.status || '').toUpperCase() === 'STARTED',
  );

const rideIsActive =
  String(foundRide.status || '').toUpperCase() === 'ACTIVE';

setTrackingEnabled(hasStartedBooking || rideIsActive);

        return;
      }

      // ===============================================
      // NOTHING PROVIDED
      // ===============================================

      setRide(null);
      setError('Ride information is missing.');
    } catch (err) {
      console.log(
        '❌ RIDE DETAILS ERROR:',
        err,
      );

      setError(
        err?.data?.error ||
          err?.data?.detail ||
          err?.message ||
          'Unable to load ride details.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ===================================================
  // LOAD WHEN SCREEN OPENS
  // ===================================================

  useFocusEffect(
    useCallback(() => {
      loadRide();

      return undefined;
    }, [rideId, selectedRide]),
  );


  useEffect(() => {
  if (!trackingEnabled || !ride?.id || !isDriverMode) {
    return undefined;
  }

  let watchId = null;
  let cancelled = false;

  const startLocationTracking = async () => {
    try {
      const permission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Go4Ryde Live Tracking',
          message:
            'Location is needed to share your live position with passengers during an active ride.',
          buttonPositive: 'Allow',
          buttonNegative: 'Cancel',
        },
      );

      if (
        cancelled ||
        permission !== PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log('Location permission was not granted.');
        return;
      }

      watchId = Geolocation.watchPosition(
        async position => {
          if (cancelled) {
            return;
          }

          const {
            latitude,
            longitude,
            heading,
            speed,
          } = position.coords;

          try {
            await updateDriverLocation({
              rideId: ride.id,
              latitude,
              longitude,
              heading:
                heading >= 0 ? heading : undefined,
              // Native GPS speed is in metres/second.
              speed:
                speed != null && speed >= 0
                  ? speed * 3.6
                  : undefined,
            });

            console.log('📍 Driver location updated:', {
              latitude,
              longitude,
            });
          } catch (error) {
            console.log(
              '❌ DRIVER LOCATION UPDATE FAILED:',
              error?.message || error,
            );
          }
        },
        error => {
          console.log(
            '❌ GPS ERROR:',
            error.message,
          );
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 5,
          interval: 3000,
          fastestInterval: 2000,
        },
      );
    } catch (error) {
      console.log(
        '❌ COULD NOT START GPS TRACKING:',
        error,
      );
    }
  };

  startLocationTracking();

  return () => {
    cancelled = true;

    if (watchId !== null) {
      Geolocation.clearWatch(watchId);
    }
  };
}, [trackingEnabled, ride?.id, isDriverMode]);

  // ===================================================
  // FORMAT DATE
  // ===================================================

  const formatDate = date => {
    if (!date) {
      return 'Time unavailable';
    }

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return String(date);
    }

    return value.toLocaleString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ===================================================
  // PASSENGER BOOKING
  // ===================================================

  const handleConfirmBooking = () => {
    if (!ride?.id) {
      Alert.alert(
        'Booking Failed',
        'Ride information is missing.',
      );

      return;
    }

    if (
      Number(ride?.seats_remaining ?? 0) <
      Number(passengers)
    ) {
      Alert.alert(
        'Not Enough Seats',
        'There are not enough seats available for this booking.',
      );

      return;
    }

    console.log(
      '🔥 CONFIRM BOOKING PRESSED',
    );

    Alert.alert(
      'Confirm Booking',
      `Book ${passengers} ${
        passengers === 1 ? 'seat' : 'seats'
      } for this ride?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Confirm',

          onPress: async () => {
            try {
              setBookingLoading(true);

              console.log(
                '🔥 ALERT CONFIRM PRESSED',
              );

              console.log(
                '🚗 CREATING BOOKING...',
              );

              console.log(
                '🚗 RIDE ID:',
                ride.id,
              );

              console.log(
                '🚗 SEATS:',
                passengers,
              );

              const response =
                await createBooking({
                  rideId: ride.id,
                  seats: passengers,
                  couponCode: '',
                });

              console.log(
                '✅ BOOKING CREATED:',
                JSON.stringify(
                  response,
                  null,
                  2,
                ),
              );

              const bookingId =
                response?.booking_id;

              const amount =
                response?.final_amount ??
                response?.amount ??
                Number(
                  ride.price_per_seat || 0,
                ) *
                  Number(
                    passengers || 1,
                  );

              if (!bookingId) {
                Alert.alert(
                  'Booking Created',
                  'Booking was created, but the booking ID was not returned.',
                );

                navigation.goBack();

                return;
              }

              // =========================================
              // GO TO PAYMENT
              // =========================================

              navigation.navigate(
                'Payment',
                {
                  bookingId,
                  amount,
                },
              );
            } catch (error) {
              console.log(
                '❌ BOOKING ERROR:',
                error,
              );

              console.log(
                '❌ BOOKING ERROR DATA:',
                JSON.stringify(
                  error?.data || {},
                  null,
                  2,
                ),
              );

              const backendError =
                error?.data?.seats ||
                error?.data?.ride ||
                error?.data?.error ||
                error?.data?.detail ||
                error?.message ||
                'Unable to create booking.';

              Alert.alert(
                'Booking Failed',
                Array.isArray(
                  backendError,
                )
                  ? backendError.join(
                      '\n',
                    )
                  : String(
                      backendError,
                    ),
              );
            } finally {
              setBookingLoading(false);
            }
          },
        },
      ],
    );
  };

  // ===================================================
  // ACCEPT BOOKING
  // ===================================================

  const handleAcceptBooking = booking => {
    console.log(
      '🔥 ACCEPT HANDLER CALLED:',
      JSON.stringify(
        booking,
        null,
        2,
      ),
    );

    if (!booking?.booking_id) {
      Alert.alert(
        'Unable to Accept',
        'Booking ID is missing.',
      );

      return;
    }

    Alert.alert(
      'Accept Ride',
      `Accept ${
        booking.name ||
        booking.username ||
        'this passenger'
      }'s booking?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Accept',

          onPress: async () => {
            try {
              setProcessingBooking(
                booking.booking_id,
              );

              console.log(
                '🚀 ACCEPTING BOOKING:',
                booking.booking_id,
              );

              const response =
                await acceptBooking(
                  booking.booking_id,
                );

              console.log(
                '✅ ACCEPT RESPONSE:',
                JSON.stringify(
                  response,
                  null,
                  2,
                ),
              );

              await loadRide();

              Alert.alert(
                'Ride Accepted',
                'The booking has been accepted successfully. Chat is now enabled.',
              );
            } catch (error) {
              console.log(
                '❌ ACCEPT ERROR:',
                error,
              );

              Alert.alert(
                'Unable to Accept',
                error?.data?.error ||
                  error?.data?.detail ||
                  error?.message ||
                  'Could not accept this booking.',
              );
            } finally {
              setProcessingBooking(null);
            }
          },
        },
      ],
    );
  };

  // ===================================================
  // REJECT BOOKING
  // ===================================================

  const handleRejectBooking = booking => {
    if (!booking?.booking_id) {
      Alert.alert(
        'Unable to Reject',
        'Booking ID is missing.',
      );

      return;
    }

    Alert.alert(
      'Reject Ride',
      `Reject ${
        booking.name ||
        booking.username ||
        'this passenger'
      }'s booking?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Reject',
          style: 'destructive',

          onPress: async () => {
            try {
              setProcessingBooking(
                booking.booking_id,
              );

              console.log(
                '❌ REJECTING BOOKING:',
                booking.booking_id,
              );

              const response =
                await rejectBooking(
                  booking.booking_id,
                );

              console.log(
                '❌ REJECT RESPONSE:',
                JSON.stringify(
                  response,
                  null,
                  2,
                ),
              );

              await loadRide();

              Alert.alert(
                'Ride Rejected',
                'The booking has been rejected.',
              );
            } catch (error) {
              console.log(
                '❌ REJECT ERROR:',
                error,
              );

              Alert.alert(
                'Unable to Reject',
                error?.data?.error ||
                  error?.data?.detail ||
                  error?.message ||
                  'Could not reject this booking.',
              );
            } finally {
              setProcessingBooking(null);
            }
          },
        },
      ],
    );
  };

  // ===================================================
  // START RIDE
  // ===================================================

  const handleStartRide = booking => {
    if (!booking?.booking_id) {
      Alert.alert(
        'Unable to Start Ride',
        'Booking ID is missing.',
      );

      return;
    }

    Alert.alert(
      'Start Ride',
      `Start the ride for ${
        booking.name ||
        booking.username ||
        'this passenger'
      }?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Start Ride',

          onPress: async () => {
            try {
              setProcessingRide(
                booking.booking_id,
              );

              console.log(
                '🚗 STARTING RIDE:',
                booking.booking_id,
              );

              const response =
                await startRide(
                  booking.booking_id,
                );

                setTrackingEnabled(true);

              console.log(
                '🚗 START RESPONSE:',
                JSON.stringify(
                  response,
                  null,
                  2,
                ),
              );

              await loadRide();

              Alert.alert(
                'Ride Started',
                'The ride has started successfully.',
              );
            } catch (error) {
              console.log(
                '❌ START RIDE ERROR:',
                error,
              );

              Alert.alert(
                'Unable to Start Ride',
                error?.data?.error ||
                  error?.data?.detail ||
                  error?.message ||
                  'Could not start the ride.',
              );
            } finally {
              setProcessingRide(null);
            }
          },
        },
      ],
    );
  };

  // ===================================================
  // END RIDE
  // ===================================================

  const handleEndRide = booking => {
    if (!booking?.booking_id) {
      Alert.alert(
        'Unable to End Ride',
        'Booking ID is missing.',
      );

      return;
    }

    Alert.alert(
      'End Ride',
      `End the ride for ${
        booking.name ||
        booking.username ||
        'this passenger'
      }?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'End Ride',
          style: 'destructive',

          onPress: async () => {
            try {
              setProcessingRide(
                booking.booking_id,
              );

              console.log(
                '🏁 ENDING RIDE:',
                booking.booking_id,
              );

              const response =
                await endRide(
                  booking.booking_id,
                );

                setTrackingEnabled(false);

              console.log(
                '🏁 END RESPONSE:',
                JSON.stringify(
                  response,
                  null,
                  2,
                ),
              );

              await loadRide();

              Alert.alert(
                'Ride Completed',
                'The ride has been completed successfully.',
              );
            } catch (error) {
              console.log(
                '❌ END RIDE ERROR:',
                error,
              );

              Alert.alert(
                'Unable to End Ride',
                error?.data?.error ||
                  error?.data?.detail ||
                  error?.message ||
                  'Could not end the ride.',
              );
            } finally {
              setProcessingRide(null);
            }
          },
        },
      ],
    );
  };

  // ===================================================
  // BOOKING STATUS
  // ===================================================

  const getStatus = booking =>
    String(
      booking?.status || '',
    ).toUpperCase();

  const getPaymentType = booking =>
    String(
      booking?.payment_type || '',
    ).toUpperCase();

  const isCOD = booking =>
    getPaymentType(booking) === 'COD';

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}>

        <StatusBar
          barStyle="dark-content"
        />

        <View style={styles.center}>

          <ActivityIndicator
            size="large"
          />

          <Text
            style={
              styles.loadingText
            }>
            Loading ride details...
          </Text>

        </View>

      </SafeAreaView>
    );
  }

  // ===================================================
  // ERROR
  // ===================================================

  if (error || !ride) {
    return (
      <SafeAreaView
        style={styles.container}>

        <StatusBar
          barStyle="dark-content"
        />

        <View style={styles.center}>

          <Text
            style={
              styles.errorTitle
            }>
            Ride unavailable
          </Text>

          <Text
            style={
              styles.errorText
            }>
            {error ||
              'Ride could not be found.'}
          </Text>

          <TouchableOpacity
            style={
              styles.backButton
            }
            onPress={() =>
              navigation.goBack()
            }>

            <Text
              style={
                styles.backButtonText
              }>
              Go Back
            </Text>

          </TouchableOpacity>

        </View>

      </SafeAreaView>
    );
  }

  // ===================================================
  // PASSENGER MODE UI
  // ===================================================

  if (isPassengerMode) {
    const driverName =
      ride?.driver?.name ||
      ride?.driver?.full_name ||
      ride?.driver?.username ||
      ride?.driver?.email ||
      ride?.driver_name ||
      'Driver';

    const avatarLetter =
      driverName?.charAt(0)?.toUpperCase() ||
      'D';

    const totalPrice =
      Number(
        ride?.price_per_seat || 0,
      ) *
      Number(
        passengers || 1,
      );

    const hasCoordinates =
      ride.source_lat != null &&
      ride.source_lng != null &&
      ride.destination_lat != null &&
      ride.destination_lng != null;

    return (
      <SafeAreaView
        style={styles.container}>

        <StatusBar
          barStyle="dark-content"
          backgroundColor="#F4F6F8"
        />

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.content
          }>

          {/* =========================================
              HEADER
          ========================================= */}

          <View
            style={
              styles.header
            }>

            <TouchableOpacity
              style={
                styles.backButton
              }
              activeOpacity={0.8}
              onPress={() =>
                navigation.goBack()
              }>

              <Text
                style={
                  styles.backButtonText
                }>
                ‹ Back
              </Text>

            </TouchableOpacity>

            <View
              style={
                styles.headerText
              }>

              <Text
                style={
                  styles.title
                }>
                Ride Details
              </Text>

              <Text
                style={
                  styles.subtitle
                }>
                Review your ride before booking
              </Text>

            </View>

          </View>

          {/* =========================================
              DRIVER
          ========================================= */}

          <View
            style={
              styles.driverCard
            }>

            <View
              style={
                styles.driverAvatar
              }>

              <Text
                style={
                  styles.driverAvatarText
                }>
                {avatarLetter}
              </Text>

            </View>

            <View
              style={
                styles.driverInfo
              }>

              <Text
                style={
                  styles.driverLabel
                }>
                DRIVER
              </Text>

              <Text
                style={
                  styles.driverName
                }
                numberOfLines={2}>
                {driverName}
              </Text>

              <Text
                style={
                  styles.driverDate
                }
                numberOfLines={2}>
                {formatDate(
                  ride.date_time,
                )}
              </Text>

            </View>

          </View>

          {/* =========================================
              ROUTE
          ========================================= */}

          <View
            style={styles.card}>

            <Text
              style={
                styles.cardLabel
              }>
              ROUTE
            </Text>

            {hasCoordinates && (
              <MapView
                style={
                  styles.routeMap
                }
                initialRegion={{
                  latitude:
                    (Number(
                      ride.source_lat,
                    ) +
                      Number(
                        ride.destination_lat,
                      )) /
                    2,

                  longitude:
                    (Number(
                      ride.source_lng,
                    ) +
                      Number(
                        ride.destination_lng,
                      )) /
                    2,

                  latitudeDelta:
                    Math.max(
                      Math.abs(
                        Number(
                          ride.source_lat,
                        ) -
                          Number(
                            ride.destination_lat,
                          ),
                      ) *
                        2 +
                        0.02,
                      0.05,
                    ),

                  longitudeDelta:
                    Math.max(
                      Math.abs(
                        Number(
                          ride.source_lng,
                        ) -
                          Number(
                            ride.destination_lng,
                          ),
                      ) *
                        2 +
                        0.02,
                      0.05,
                    ),
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}>

                <Marker
                  coordinate={{
                    latitude:
                      Number(
                        ride.source_lat,
                      ),
                    longitude:
                      Number(
                        ride.source_lng,
                      ),
                  }}
                  title="Pickup"
                  pinColor="green"
                />

                <Marker
                  coordinate={{
                    latitude:
                      Number(
                        ride.destination_lat,
                      ),
                    longitude:
                      Number(
                        ride.destination_lng,
                      ),
                  }}
                  title="Destination"
                  pinColor="red"
                />

                <Polyline
                  coordinates={[
                    {
                      latitude:
                        Number(
                          ride.source_lat,
                        ),
                      longitude:
                        Number(
                          ride.source_lng,
                        ),
                    },
                    {
                      latitude:
                        Number(
                          ride.destination_lat,
                        ),
                      longitude:
                        Number(
                          ride.destination_lng,
                        ),
                    },
                  ]}
                  strokeWidth={4}
                />

              </MapView>
            )}

            {/* =======================================
                FROM
            ======================================= */}

            <View
              style={
                styles.routeLocationContainer
              }>

              <View
                style={
                  styles.locationBlock
                }>

                <Text
                  style={
                    styles.locationLabel
                  }>
                  FROM
                </Text>

                <Text
                  style={
                    styles.location
                  }>
                  {ride.source ||
                    'Location unavailable'}
                </Text>

              </View>

              <Text
                style={
                  styles.routeArrow
                }>
                ↓
              </Text>

              {/* =====================================
                  TO
              ===================================== */}

              <View
                style={
                  styles.locationBlock
                }>

                <Text
                  style={
                    styles.locationLabel
                  }>
                  TO
                </Text>

                <Text
                  style={
                    styles.location
                  }>
                  {ride.destination ||
                    'Location unavailable'}
                </Text>

              </View>

            </View>

          </View>

          {/* =========================================
              RIDE INFORMATION
          ========================================= */}

          <View
            style={styles.card}>

            <Text
              style={
                styles.cardLabel
              }>
              RIDE INFORMATION
            </Text>

            <View
              style={
                styles.infoGrid
              }>

              <View
                style={
                  styles.infoBox
                }>

                <Text
                  style={
                    styles.infoGridLabel
                  }>
                  DATE & TIME
                </Text>

                <Text
                  style={
                    styles.infoGridValue
                  }>
                  {formatDate(
                    ride.date_time,
                  )}
                </Text>

              </View>

              <View
                style={
                  styles.infoBox
                }>

                <Text
                  style={
                    styles.infoGridLabel
                  }>
                  DISTANCE
                </Text>

                <Text
                  style={
                    styles.infoGridValue
                  }>
                  {ride.distance_km
                    ? `${ride.distance_km} km`
                    : '--'}
                </Text>

              </View>

              <View
                style={
                  styles.infoBox
                }>

                <Text
                  style={
                    styles.infoGridLabel
                  }>
                  DURATION
                </Text>

                <Text
                  style={
                    styles.infoGridValue
                  }>
                  {ride.duration_min
                    ? `${ride.duration_min} min`
                    : '--'}
                </Text>

              </View>

              <View
                style={
                  styles.infoBox
                }>

                <Text
                  style={
                    styles.infoGridLabel
                  }>
                  AVAILABLE SEATS
                </Text>

                <Text
                  style={
                    styles.infoGridValue
                  }>
                  {ride.seats_remaining ??
                    0}
                </Text>

              </View>

            </View>

          </View>

          {/* =========================================
              PASSENGERS
          ========================================= */}

          <View
            style={styles.card}>

            <Text
              style={
                styles.cardLabel
              }>
              YOUR BOOKING
            </Text>

            <View
              style={
                styles.bookingRow
              }>

              <View
                style={{
                  flex: 1,
                  minWidth: 0,
                }}>

                <Text
                  style={
                    styles.bookingTitle
                  }>
                  Passengers
                </Text>

                <Text
                  style={
                    styles.bookingSubtitle
                  }>
                  Seats you want to book
                </Text>

              </View>

              <Text
                style={
                  styles.bookingCount
                }>
                {passengers}
              </Text>

            </View>

          </View>

          {/* =========================================
              PRICE
          ========================================= */}

          <View
            style={
              styles.priceCard
            }>

            <View
              style={{
                flex: 1,
                minWidth: 0,
              }}>

              <Text
                style={
                  styles.priceLabel
                }>
                TOTAL PRICE
              </Text>

              <Text
                style={
                  styles.priceSubtext
                }>
                ₹
                {ride.price_per_seat ??
                  '--'}{' '}
                × {passengers}{' '}
                {passengers === 1
                  ? 'seat'
                  : 'seats'}
              </Text>

            </View>

            <Text
              style={
                styles.totalPrice
              }>
              ₹
              {totalPrice}
            </Text>

          </View>

          {/* =========================================
              CONFIRM BOOKING
          ========================================= */}

          <TouchableOpacity
            style={[
              styles.confirmButton,
              bookingLoading &&
                styles.disabledButton,
            ]}
            activeOpacity={0.85}
            disabled={
              bookingLoading
            }
            onPress={
              handleConfirmBooking
            }>

            {bookingLoading ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <>
                <Text
                  style={
                    styles.confirmButtonText
                  }>
                  Confirm Booking
                </Text>

                <Text
                  style={
                    styles.confirmButtonArrow
                  }>
                  →
                </Text>
              </>
            )}

          </TouchableOpacity>

        </ScrollView>

      </SafeAreaView>
    );
  }

  // ===================================================
  // DRIVER MODE
  // ===================================================

  const bookings = Array.isArray(
    ride.booked_users,
  )
    ? ride.booked_users
    : [];

  const activeBookings =
    bookings.filter(booking => {
      const status =
        getStatus(booking);

      return (
        status === 'PENDING' ||
        status === 'CONFIRMED' ||
        status === 'ACCEPTED' ||
        status === 'STARTED'
      );
    });

  const completedBookings =
    bookings.filter(
      booking =>
        getStatus(booking) ===
        'COMPLETED',
    );

  // ===================================================
  // DRIVER UI
  // ===================================================

  return (
    <SafeAreaView
      style={styles.container}>

      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F8FAFC"
      />

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              loadRide(true)
            }
          />
        }>

        {/* =========================================
            HEADER
        ========================================= */}

        <View
          style={
            styles.header
          }>

          <TouchableOpacity
            style={
              styles.backButtonSmall
            }
            onPress={() =>
              navigation.goBack()
            }>

            <Text
              style={
                styles.backButtonSmallText
              }>
              ← Back
            </Text>

          </TouchableOpacity>

          <Text
            style={
              styles.eyebrow
            }>
            RIDE DETAILS
          </Text>

          <Text
            style={
              styles.title
            }
            numberOfLines={3}>
            {ride.source ||
              'Source unavailable'}
          </Text>

          <Text
            style={
              styles.routeArrow
            }>
            ↓
          </Text>

          <Text
            style={
              styles.title
            }
            numberOfLines={3}>
            {ride.destination ||
              'Destination unavailable'}
          </Text>

        </View>

        {/* =========================================
            RIDE INFORMATION
        ========================================= */}

        <View
          style={
            styles.section
          }>

          <Text
            style={
              styles.sectionTitle
            }>
            Ride Information
          </Text>

          <View
            style={
              styles.infoCard
            }>

            {/* FROM */}

            <View
              style={
                styles.infoRow
              }>

              <Text
                style={
                  styles.infoRowLabel
                }>
                From
              </Text>

              <Text
                style={
                  styles.infoRowValue
                }>
                {ride.source ||
                  'Not available'}
              </Text>

            </View>

            <View
              style={
                styles.divider
              }
            />

            {/* TO */}

            <View
              style={
                styles.infoRow
              }>

              <Text
                style={
                  styles.infoRowLabel
                }>
                To
              </Text>

              <Text
                style={
                  styles.infoRowValue
                }>
                {ride.destination ||
                  'Not available'}
              </Text>

            </View>

            <View
              style={
                styles.divider
              }
            />

            {/* DATE */}

            <View
              style={
                styles.infoRow
              }>

              <Text
                style={
                  styles.infoRowLabel
                }>
                Date & Time
              </Text>

              <Text
                style={
                  styles.infoRowValue
                }>
                {formatDate(
                  ride.date_time,
                )}
              </Text>

            </View>

            <View
              style={
                styles.divider
              }
            />

            {/* PRICE */}

            <View
              style={
                styles.infoRow
              }>

              <Text
                style={
                  styles.infoRowLabel
                }>
                Price / Seat
              </Text>

              <Text
                style={
                  styles.infoRowValue
                }>
                ₹
                {ride.price_per_seat ??
                  0}
              </Text>

            </View>

            <View
              style={
                styles.divider
              }
            />

            {/* BOOKINGS */}

            <View
              style={
                styles.infoRow
              }>

              <Text
                style={
                  styles.infoRowLabel
                }>
                Bookings
              </Text>

              <Text
                style={
                  styles.infoRowValue
                }>
                {ride.bookings_count ??
                  bookings.length}
              </Text>

            </View>

          </View>

        </View>

        {/* =========================================
            PASSENGER REQUESTS
        ========================================= */}

        <View
          style={
            styles.section
          }>

          <Text
            style={
              styles.sectionTitle
            }>
            Passenger Requests
          </Text>

          {activeBookings.length ===
          0 ? (
            <View
              style={
                styles.emptyCard
              }>

              <Text
                style={
                  styles.emptyTitle
                }>
                No active passenger requests
              </Text>

              <Text
                style={
                  styles.emptyText
                }>
                New passenger bookings will
                appear here.
              </Text>

            </View>
          ) : (
            activeBookings.map(
              booking => {
                const status =
                  getStatus(
                    booking,
                  );

                const cod =
                  isCOD(
                    booking,
                  );

                const processing =
                  processingBooking ===
                  booking.booking_id;

                const rideProcessing =
                  processingRide ===
                  booking.booking_id;

                const isPending =
                  status ===
                  'PENDING';

                const isConfirmed =
                  status ===
                  'CONFIRMED';

                const isAccepted =
                  status ===
                  'ACCEPTED';

                const isStarted =
                  status ===
                  'STARTED';

                const showActions =
                  (isPending &&
                    cod) ||
                  isConfirmed;

                return (
                  <View
                    key={String(
                      booking.booking_id,
                    )}
                    style={
                      styles.passengerCard
                    }>

                    {/* PASSENGER */}

                    <View
                      style={
                        styles.passengerHeader
                      }>

                      <View
                        style={
                          styles.passengerInfo
                        }>

                        <Text
                          style={
                            styles.passengerName
                          }
                          numberOfLines={2}>
                          {booking.name ||
                            booking.username ||
                            'Passenger'}
                        </Text>

                        <Text
                          style={
                            styles.passengerSeats
                          }>
                          Seats:{' '}
                          {booking.seats ||
                            1}
                        </Text>

                        <Text
                          style={
                            styles.paymentText
                          }>
                          {cod
                            ? '💵 Payment: CASH'
                            : '💳 Payment: ONLINE'}
                        </Text>

                      </View>

                      <View
                        style={
                          styles.statusBadge
                        }>

                        <Text
                          style={
                            styles.statusBadgeText
                          }>
                          {status}
                        </Text>

                      </View>

                    </View>

                    {/* CONTACT */}

                    <View
                      style={
                        styles.contactBox
                      }>

                      <Text
                        style={
                          styles.contactText
                        }>
                        📧{' '}
                        {booking.email ||
                          'Email not available'}
                      </Text>

                      <Text
                        style={
                          styles.contactText
                        }>
                        📞{' '}
                        {booking.phone ||
                          'Phone not available'}
                      </Text>

                    </View>

                    {/* PENDING */}

                    {isPending && (
                      <Text
                        style={
                          styles.messageText
                        }>
                        {cod
                          ? '💵 Cash payment selected — action required'
                          : 'Waiting for passenger payment'}
                      </Text>
                    )}

                    {/* ACCEPT / REJECT */}

                    {showActions && (
                      <View
                        style={
                          styles.actionContainer
                        }>

                        <Text
                          style={
                            styles.actionHint
                          }>
                          {cod
                            ? '💵 Cash payment selected — action required'
                            : '✓ Payment received — action required'}
                        </Text>

                        <View
                          style={
                            styles.actionRow
                          }>

                          <TouchableOpacity
                            style={[
                              styles.acceptButton,
                              processing &&
                                styles.disabledButton,
                            ]}
                            activeOpacity={0.7}
                            disabled={
                              processing ||
                              rideProcessing
                            }
                            onPress={() =>
                              handleAcceptBooking(
                                booking,
                              )
                            }>

                            {processing ? (
                              <ActivityIndicator
                                size="small"
                                color="#FFFFFF"
                              />
                            ) : (
                              <Text
                                style={
                                  styles.acceptButtonText
                                }>
                                ✓ Accept
                              </Text>
                            )}

                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              styles.rejectButton,
                              processing &&
                                styles.disabledRejectButton,
                            ]}
                            activeOpacity={0.7}
                            disabled={
                              processing ||
                              rideProcessing
                            }
                            onPress={() =>
                              handleRejectBooking(
                                booking,
                              )
                            }>

                            <Text
                              style={
                                styles.rejectButtonText
                              }>
                              ✕ Reject
                            </Text>

                          </TouchableOpacity>

                        </View>

                      </View>
                    )}

                    {/* ACCEPTED */}

                    {isAccepted && (
                      <View
                        style={
                          styles.actionContainer
                        }>

                        <Text
                          style={
                            styles.successText
                          }>
                          ✓ Booking accepted •
                          Chat enabled
                        </Text>

                        <TouchableOpacity
                          style={
                            styles.chatButton
                          }
                          disabled={
                            rideProcessing
                          }
                          onPress={() =>
                            navigation.navigate(
                              'Chat',
                              {
                                bookingId:
                                  booking.booking_id,

                                passengerName:
                                  booking.name ||
                                  booking.username ||
                                  'Passenger',

                                driverName:
                                  booking.driver_name ||
                                  'Driver',

                                currentUserRole:
                                  'DRIVER',
                              },
                            )
                          }>

                          <Text
                            style={
                              styles.chatButtonText
                            }>
                            💬 Open Chat
                          </Text>

                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.startRideButton,
                            rideProcessing &&
                              styles.disabledButton,
                          ]}
                          disabled={
                            rideProcessing
                          }
                          onPress={() =>
                            handleStartRide(
                              booking,
                            )
                          }>

                          {rideProcessing ? (
                            <ActivityIndicator
                              size="small"
                              color="#FFFFFF"
                            />
                          ) : (
                            <Text
                              style={
                                styles.startRideButtonText
                              }>
                              🚗 Start Ride
                            </Text>
                          )}

                        </TouchableOpacity>

                      </View>
                    )}

                    {/* STARTED */}

                    {isStarted && (
                      <View
                        style={
                          styles.actionContainer
                        }>

                        <Text
                          style={
                            styles.successText
                          }>
                          🚗 Ride in progress
                        </Text>

                        <TouchableOpacity
                          style={[
                            styles.chatButton,
                            {
                              marginBottom: 10,
                            },
                          ]}
                          onPress={() =>
                            navigation.navigate(
                              'Chat',
                              {
                                bookingId:
                                  booking.booking_id,

                                passengerName:
                                  booking.name ||
                                  booking.username ||
                                  'Passenger',

                                driverName:
                                  booking.driver_name ||
                                  'Driver',

                                currentUserRole:
                                  'DRIVER',
                              },
                            )
                          }>

                          <Text
                            style={
                              styles.chatButtonText
                            }>
                            💬 Open Chat
                          </Text>

                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.endRideButton,
                            rideProcessing &&
                              styles.disabledButton,
                          ]}
                          disabled={
                            rideProcessing
                          }
                          onPress={() =>
                            handleEndRide(
                              booking,
                            )
                          }>

                          {rideProcessing ? (
                            <ActivityIndicator
                              size="small"
                              color="#FFFFFF"
                            />
                          ) : (
                            <Text
                              style={
                                styles.endRideButtonText
                              }>
                              🏁 End Ride
                            </Text>
                          )}

                        </TouchableOpacity>

                      </View>
                    )}

                  </View>
                );
              },
            )
          )}

        </View>

        {/* =========================================
            COMPLETED PASSENGERS
        ========================================= */}

        <View
          style={
            styles.section
          }>

          <Text
            style={
              styles.sectionTitle
            }>
            Completed Passengers
          </Text>

          {completedBookings.length ===
          0 ? (
            <View
              style={
                styles.emptyCard
              }>

              <Text
                style={
                  styles.emptyText
                }>
                No completed passengers yet.
              </Text>

            </View>
          ) : (
            completedBookings.map(
              booking => (
                <View
                  key={String(
                    booking.booking_id,
                  )}
                  style={
                    styles.completedCard
                  }>

                  <View
                    style={
                      styles.completedLeft
                    }>

                    <Text
                      style={
                        styles.completedName
                      }
                      numberOfLines={2}>
                      👤{' '}
                      {booking.name ||
                        booking.username ||
                        'Passenger'}
                    </Text>

                    <Text
                      style={
                        styles.completedStatus
                      }>
                      ✓ Ride completed
                    </Text>

                  </View>

                  <View
                    style={
                      styles.completedRight
                    }>

                    <Text
                      style={
                        styles.amountLabel
                      }>
                      Amount
                    </Text>

                    <Text
                      style={
                        styles.amountValue
                      }>
                      ₹
                      {booking.amount ??
                        booking.final_amount ??
                        booking.total_amount ??
                        0}
                    </Text>

                  </View>

                </View>
              ),
            )
          )}

        </View>

      </ScrollView>

    </SafeAreaView>
  );
};

export default RideDetailsScreen;
