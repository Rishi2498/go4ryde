import React, {useEffect, useRef, useState} from 'react';

import {
  ActivityIndicator,
  Alert,
  Linking,
  PermissionsAndroid,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';

import MapView, {Marker, Polyline} from 'react-native-maps';

import Geolocation from '@react-native-community/geolocation';

import styles from '../../styles/LocationPicker.styles';

const DEFAULT_REGION = {
  latitude: 17.3850,
  longitude: 78.4867,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};

const LocationPicker = ({
  source,
  destination,
  onSourceChange,
  onDestinationChange,
}) => {
  const mapRef = useRef(null);

  const [currentLocation, setCurrentLocation] = useState(null);

  const [selecting, setSelecting] = useState('source');

  const [mapVisible, setMapVisible] = useState(false);

  const [sourceText, setSourceText] = useState(
    source?.name || '',
  );

  const [destinationText, setDestinationText] = useState(
    destination?.name || '',
  );

  const [searching, setSearching] = useState(false);

  const [searchResults, setSearchResults] = useState([]);

  const [searchField, setSearchField] = useState('source');

  // =====================================================
  // SYNC WITH PARENT
  // =====================================================

  useEffect(() => {
    setSourceText(source?.name || '');
  }, [source]);

  useEffect(() => {
    setDestinationText(destination?.name || '');
  }, [destination]);

  // =====================================================
  // LOCATION PERMISSION
  // =====================================================

  
const requestLocationPermission = async () => {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const permission =
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;

    const alreadyGranted = await PermissionsAndroid.check(permission);

    if (alreadyGranted) {
      return true;
    }

    const result = await PermissionsAndroid.request(permission, {
      title: 'Go4Ryde Location Permission',
      message:
        'Allow location access to set your pickup point using your current location.',
      buttonPositive: 'Allow',
      buttonNegative: 'Not now',
    });

    if (result === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    }

    if (
      result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
    ) {
      Alert.alert(
        'Location Permission Required',
        'Location access is disabled for Go4Ryde. Open app settings if you want to use your current location.',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Open Settings',
            onPress: () => {
              Linking.openSettings().catch(error =>
                console.log('OPEN SETTINGS ERROR:', error),
              );
            },
          },
        ],
      );
    } else {
      Alert.alert(
        'Location Permission',
        'Location access was not granted. You can still enter or select your pickup location manually.',
      );
    }

    return false;
  } catch (error) {
    console.log('LOCATION PERMISSION ERROR:', error);
    Alert.alert(
      'Location Error',
      'Unable to check location permission. Please try again.',
    );
    return false;
  }
};


  // =====================================================
  // GET CURRENT LOCATION
  // =====================================================

  const getCurrentLocation = async () => {
    const allowed = await requestLocationPermission();

    if (!allowed) {
      Alert.alert(
        'Location Permission',
        'Please allow location permission to use your current location.',
      );
      return;
    }

    Geolocation.getCurrentPosition(
      position => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setCurrentLocation(coords);

        onSourceChange({
          latitude: coords.latitude,
          longitude: coords.longitude,
          name: 'Current location',
        });

        setSourceText('Current location');

        setSelecting('destination');
      },
      error => {
        console.log('CURRENT LOCATION ERROR:', error);

        Alert.alert(
          'Location Error',
          'Unable to get your current location.',
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  };

  // =====================================================
  // INITIAL GPS LOCATION
  // =====================================================

  useEffect(() => {
  let cancelled = false;

  const loadLocationIfAlreadyAllowed = async () => {
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );

      if (!granted || cancelled) {
        return;
      }

      Geolocation.getCurrentPosition(
        position => {
          if (cancelled) {
            return;
          }

          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        error => {
          console.log('INITIAL LOCATION ERROR:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    } catch (error) {
      console.log('INITIAL LOCATION PERMISSION CHECK ERROR:', error);
    }
  };

  loadLocationIfAlreadyAllowed();

  return () => {
    cancelled = true;
  };
}, []);

  // =====================================================
  // SEARCH LOCATION
  // =====================================================

  const searchLocation = async text => {
    if (!text || text.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);

      const url =
        'https://nominatim.openstreetmap.org/search?' +
        `q=${encodeURIComponent(text)}` +
        '&format=json' +
        '&limit=5' +
        '&countrycodes=in';

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Go4Ryde/1.0',
        },
      });

      const data = await response.json();

      setSearchResults(
        Array.isArray(data) ? data : [],
      );
    } catch (error) {
      console.log('LOCATION SEARCH ERROR:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // =====================================================
  // SELECT SEARCH RESULT
  // =====================================================

  const selectSearchResult = result => {
    const location = {
      latitude: Number(result.lat),
      longitude: Number(result.lon),
      name: result.display_name,
    };

    if (searchField === 'source') {
      setSourceText(location.name);
      onSourceChange(location);

      // After pickup, automatically move to destination.
      setSelecting('destination');
    } else {
      setDestinationText(location.name);
      onDestinationChange(location);
    }

    setSearchResults([]);
  };

  // =====================================================
  // OPEN MAP
  // =====================================================

  const openMap = field => {
    setSelecting(field);
    setMapVisible(true);

    setTimeout(() => {
      const location =
        field === 'source'
          ? source
          : destination;

      if (location) {
        mapRef.current?.animateToRegion(
          {
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.025,
            longitudeDelta: 0.025,
          },
          500,
        );
      } else if (currentLocation) {
        mapRef.current?.animateToRegion(
          {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.025,
            longitudeDelta: 0.025,
          },
          500,
        );
      }
    }, 300);
  };

  // =====================================================
  // MAP PRESS
  // =====================================================

  const handleMapPress = async event => {
  const coordinate = event.nativeEvent.coordinate;

  try {
    setSearching(true);

    const url =
      'https://nominatim.openstreetmap.org/reverse?' +
      `lat=${coordinate.latitude}` +
      `&lon=${coordinate.longitude}` +
      '&format=json' +
      '&addressdetails=1';

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Go4Ryde/1.0',
      },
    });

    const data = await response.json();

    const fullAddress =
      data?.display_name ||
      `${coordinate.latitude.toFixed(6)}, ${coordinate.longitude.toFixed(6)}`;

    const location = {
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      name: fullAddress,
    };

    if (selecting === 'source') {
      onSourceChange(location);
      setSourceText(fullAddress);

      // After pickup is selected,
      // automatically select destination next.
      setSelecting('destination');

      console.log('📍 PICKUP:', location);

      return;
    }

    onDestinationChange(location);
    setDestinationText(fullAddress);

    console.log('📍 DESTINATION:', location);

  } catch (error) {
    console.log('REVERSE GEOCODING ERROR:', error);

    const fallbackAddress =
      `${coordinate.latitude.toFixed(6)}, ` +
      `${coordinate.longitude.toFixed(6)}`;

    const location = {
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      name: fallbackAddress,
    };

    if (selecting === 'source') {
      onSourceChange(location);
      setSourceText(fallbackAddress);
      setSelecting('destination');
    } else {
      onDestinationChange(location);
      setDestinationText(fallbackAddress);
    }

  } finally {
    setSearching(false);
  }
};
  // =====================================================
  // CONFIRM MAP
  // =====================================================

  const confirmMapSelection = () => {
    if (!source) {
      Alert.alert(
        'Pickup required',
        'Please select your pickup location first.',
      );
      setSelecting('source');
      return;
    }

    if (!destination) {
      Alert.alert(
        'Destination required',
        'Please select your destination.',
      );
      setSelecting('destination');
      return;
    }

    setMapVisible(false);
  };

  // =====================================================
  // MAP REGION
  // =====================================================

  const getRegion = () => {
    if (source && destination) {
      const minLat = Math.min(
        source.latitude,
        destination.latitude,
      );

      const maxLat = Math.max(
        source.latitude,
        destination.latitude,
      );

      const minLng = Math.min(
        source.longitude,
        destination.longitude,
      );

      const maxLng = Math.max(
        source.longitude,
        destination.longitude,
      );

      return {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: Math.max(
          maxLat - minLat + 0.05,
          0.05,
        ),
        longitudeDelta: Math.max(
          maxLng - minLng + 0.05,
          0.05,
        ),
      };
    }

    if (source) {
      return {
        latitude: source.latitude,
        longitude: source.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }

    if (currentLocation) {
      return {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }

    return DEFAULT_REGION;
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <View style={styles.container}>

      {/* FROM */}

      <View style={styles.locationCard}>

        <View style={styles.inputRow}>

          <View style={styles.routeColumn}>
            <View style={styles.sourceDot} />
            <View style={styles.routeLine} />
          </View>

          <View style={styles.inputContent}>

            <Text style={styles.label}>
              FROM
            </Text>

            <TextInput
              value={sourceText}
              onChangeText={text => {
                setSourceText(text);
                setSearchField('source');
                searchLocation(text);
              }}
              onFocus={() => {
                setSearchField('source');
              }}
              placeholder="Enter pickup location"
              placeholderTextColor="#8A98A2"
              style={styles.textInput}
              autoCorrect={false}
            />

          </View>

          <TouchableOpacity
            style={styles.mapSmallButton}
            onPress={() => openMap('source')}>

            <Text style={styles.mapSmallButtonText}>
              MAP
            </Text>

          </TouchableOpacity>

        </View>

        {/* TO */}

        <View style={styles.inputRow}>

          <View style={styles.routeColumn}>
            <View style={styles.destinationDot} />
          </View>

          <View style={styles.inputContent}>

            <Text style={styles.label}>
              TO
            </Text>

            <TextInput
              value={destinationText}
              onChangeText={text => {
                setDestinationText(text);
                setSearchField('destination');
                searchLocation(text);
              }}
              onFocus={() => {
                setSearchField('destination');
              }}
              placeholder="Enter destination"
              placeholderTextColor="#8A98A2"
              style={styles.textInput}
              autoCorrect={false}
            />

          </View>

          <TouchableOpacity
            style={styles.mapSmallButton}
            onPress={() => openMap('destination')}>

            <Text style={styles.mapSmallButtonText}>
              MAP
            </Text>

          </TouchableOpacity>

        </View>

      </View>

      {/* SEARCH RESULTS */}

      {searchResults.length > 0 && (
        <View style={styles.searchResultsCard}>

          {searchResults.map((result, index) => (
            <TouchableOpacity
              key={`${result.place_id}-${index}`}
              style={styles.searchResult}
              onPress={() =>
                selectSearchResult(result)
              }>

              <Text style={styles.searchResultIcon}>
                ●
              </Text>

              <Text
                style={styles.searchResultText}
                numberOfLines={2}>

                {result.display_name}

              </Text>

            </TouchableOpacity>
          ))}

        </View>
      )}

      {searching && (
        <View style={styles.searchingContainer}>

          <ActivityIndicator size="small" />

          <Text style={styles.searchingText}>
            Searching locations...
          </Text>

        </View>
      )}

      {/* CURRENT LOCATION */}

      <TouchableOpacity
        style={styles.currentLocationButton}
        onPress={getCurrentLocation}
        activeOpacity={0.8}>

        <Text style={styles.currentLocationIcon}>
          ◎
        </Text>

        <View style={styles.currentLocationContent}>

          <Text style={styles.currentLocationText}>
            Use current location
          </Text>

          <Text style={styles.currentLocationSubtext}>
            Set pickup automatically
          </Text>

        </View>

      </TouchableOpacity>

      {/* SELECT ON MAP */}

      <TouchableOpacity
        style={styles.selectMapButton}
        onPress={() => openMap('source')}
        activeOpacity={0.8}>

        <Text style={styles.selectMapIcon}>
          ⌖
        </Text>

        <View style={styles.selectMapContent}>

          <Text style={styles.selectMapTitle}>
            Select on map
          </Text>

          <Text style={styles.selectMapSubtitle}>
            Pin pickup and destination
          </Text>

        </View>

        <Text style={styles.selectMapArrow}>
          ›
        </Text>

      </TouchableOpacity>

      {/* MAP */}

      <Modal
        visible={mapVisible}
        animationType="slide"
        onRequestClose={() =>
          setMapVisible(false)
        }>

        <View style={styles.mapModal}>

          <View style={styles.mapHeader}>

            <TouchableOpacity
              style={styles.mapBackButton}
              onPress={() =>
                setMapVisible(false)
              }>

              <Text style={styles.mapBackIcon}>
                ‹
              </Text>

            </TouchableOpacity>

            <View>

              <Text style={styles.mapHeaderTitle}>
                Select location
              </Text>

              <Text style={styles.mapHeaderSubtitle}>
                {selecting === 'source'
                  ? 'Choose pickup point'
                  : 'Choose destination'}
              </Text>

            </View>

          </View>

          <MapView
            ref={mapRef}
            style={styles.fullMap}
            initialRegion={getRegion()}
            showsUserLocation={true}
            showsMyLocationButton={false}
            onPress={handleMapPress}>

            {currentLocation && (
              <Marker
                coordinate={currentLocation}
                title="Your location"
              />
            )}

            {source && (
              <Marker
                coordinate={{
                  latitude: source.latitude,
                  longitude: source.longitude,
                }}
                title="Pickup"
                pinColor="green"
              />
            )}

            {destination && (
              <Marker
                coordinate={{
                  latitude: destination.latitude,
                  longitude: destination.longitude,
                }}
                title="Destination"
                pinColor="red"
              />
            )}

            {source && destination && (
              <Polyline
                coordinates={[
                  {
                    latitude: source.latitude,
                    longitude: source.longitude,
                  },
                  {
                    latitude: destination.latitude,
                    longitude: destination.longitude,
                  },
                ]}
                strokeWidth={4}
              />
            )}

          </MapView>

          <View style={styles.mapHintContainer}>

            <Text style={styles.mapHintTitle}>
              {selecting === 'source'
                ? '📍 Select pickup'
                : '📍 Select destination'}
            </Text>

            <Text style={styles.mapHintText}>
              Tap anywhere on the map
            </Text>

          </View>

          <View style={styles.mapBottomPanel}>

            <View style={styles.mapSelectionRow}>

              <TouchableOpacity
                style={[
                  styles.mapSelectionButton,
                  selecting === 'source' &&
                    styles.mapSelectionButtonActive,
                ]}
                onPress={() =>
                  setSelecting('source')
                }>

                <View style={styles.sourceDotSmall} />

                <Text
                  style={[
                    styles.mapSelectionText,
                    selecting === 'source' &&
                      styles.mapSelectionTextActive,
                  ]}>

                  Pickup

                </Text>

              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.mapSelectionButton,
                  selecting === 'destination' &&
                    styles.mapSelectionButtonActive,
                ]}
                onPress={() =>
                  setSelecting('destination')
                }>

                <View
                  style={styles.destinationDotSmall}
                />

                <Text
                  style={[
                    styles.mapSelectionText,
                    selecting === 'destination' &&
                      styles.mapSelectionTextActive,
                  ]}>

                  Destination

                </Text>

              </TouchableOpacity>

            </View>

            <TouchableOpacity
              style={styles.confirmMapButton}
              onPress={confirmMapSelection}>

              <Text style={styles.confirmMapButtonText}>
                Confirm locations
              </Text>

            </TouchableOpacity>

          </View>

        </View>

      </Modal>

    </View>
  );
};

export default LocationPicker;