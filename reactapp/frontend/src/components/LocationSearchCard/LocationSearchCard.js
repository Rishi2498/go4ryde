import React from 'react';

import {
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import styles from '../../styles/components/LocationSearchCard.styles';

const LocationSearchCard = () => {
  return (
    <View style={styles.card}>

      {/* =================================================
          FROM
      ================================================= */}

      <View style={styles.locationRow}>

        <View style={styles.iconContainer}>
          <View style={styles.originDot} />
        </View>

        <View style={styles.locationContent}>

          <Text style={styles.label}>
            FROM
          </Text>

          <Text style={styles.value}>
            Your location
          </Text>

        </View>

        <Text style={styles.locationArrow}>
          ›
        </Text>

      </View>


      {/* =================================================
          ROUTE LINE
      ================================================= */}

      <View style={styles.routeContainer}>

        <View style={styles.routeLine} />

      </View>


      {/* =================================================
          TO
      ================================================= */}

      <View style={styles.locationRow}>

        <View style={styles.iconContainer}>
          <View style={styles.destinationDot} />
        </View>

        <View style={styles.locationContent}>

          <Text style={styles.label}>
            TO
          </Text>

          <Text style={styles.value}>
            Where do you want to go?
          </Text>

        </View>

        <Text style={styles.locationArrow}>
          ›
        </Text>

      </View>


      {/* =================================================
          OPTIONS
      ================================================= */}

      <View style={styles.options}>

        {/* DATE */}

        <View style={styles.option}>

          <View style={styles.optionIconContainer}>

            <Text style={styles.optionIcon}>
              📅
            </Text>

          </View>

          <View style={styles.optionContent}>

            <Text style={styles.optionLabel}>
              DATE
            </Text>

            <Text style={styles.optionValue}>
              Today
            </Text>

          </View>

        </View>


        {/* DIVIDER */}

        <View style={styles.divider} />


        {/* PASSENGERS */}

        <View style={styles.option}>

          <View style={styles.optionIconContainer}>

            <Text style={styles.optionIcon}>
              👤
            </Text>

          </View>

          <View style={styles.optionContent}>

            <Text style={styles.optionLabel}>
              PASSENGERS
            </Text>

            <Text style={styles.optionValue}>
              1 passenger
            </Text>

          </View>

        </View>

      </View>


      {/* =================================================
          FIND BUTTON
      ================================================= */}

      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.8}>

        <Text style={styles.buttonText}>
          Find a ride
        </Text>

        <Text style={styles.buttonArrow}>
          →
        </Text>

      </TouchableOpacity>

    </View>
  );
};

export default LocationSearchCard;