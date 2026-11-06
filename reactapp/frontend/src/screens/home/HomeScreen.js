import React, {useCallback, useState} from 'react';

import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {useFocusEffect} from '@react-navigation/native';

import styles from '../../styles/HomeScreen.styles';

import LocationSearchCard from '../../components/LocationSearchCard/LocationSearchCard';
import RideTypeCard from '../../components/RideTypeCard/RideTypeCard';

import {testBackend} from '../../services/backendTest';

const HomeScreen = ({navigation}) => {
  const [refreshing, setRefreshing] = useState(false);

  // =====================================================
  // BACKEND
  // =====================================================

  const refreshHome = async () => {
    try {
      const result = await testBackend();
      console.log('DJANGO RESPONSE:', result);
    } catch (error) {
      console.log('DJANGO ERROR:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      refreshHome();
    }, []),
  );

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await refreshHome();
    } finally {
      setRefreshing(false);
    }
  };

  // =====================================================
  // NAVIGATION
  // =====================================================

  const openFindRide = () => {
    navigation.navigate('FindRide');
  };

  const openOfferRide = () => {
    navigation.navigate('CreateRide');
  };

  const openBookings = () => {
    navigation.navigate('MyBookings');
  };

  const openMyRides = () => {
    navigation.navigate('MyRides');
  };

  const openProfile = () => {
    navigation.navigate('Profile');
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F6F8FA"
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#16384A']}
            tintColor="#16384A"
          />
        }>

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <View style={styles.header}>
          <View style={styles.headerRow}>

            <View style={styles.headerText}>
              <Text style={styles.eyebrow}>
                GO4RYDE
              </Text>

              <Text style={styles.title}>
                Where are you going?
              </Text>

              <Text style={styles.subtitle}>
                Find a ride or share your journey.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.profileButton}
              activeOpacity={0.8}
              onPress={openProfile}>

              <Text style={styles.profileButtonText}>
                M
              </Text>

            </TouchableOpacity>

          </View>
        </View>


        {/* ================================================= */}
        {/* QUICK ACTIONS */}
        {/* ================================================= */}

        <View style={styles.quickCard}>

          <TouchableOpacity
            style={styles.quickItem}
            activeOpacity={0.75}
            onPress={openBookings}>

            <View style={styles.quickIcon}>
              <Text style={styles.quickIconText}>
                📋
              </Text>
            </View>

            <View style={styles.quickText}>
              <Text style={styles.quickTitle}>
                My Bookings
              </Text>

              <Text style={styles.quickSubtitle}>
                View trips
              </Text>
            </View>

          </TouchableOpacity>


          <View style={styles.quickDivider} />


          <TouchableOpacity
            style={styles.quickItem}
            activeOpacity={0.75}
            onPress={openMyRides}>

            <View style={styles.quickIcon}>
              <Text style={styles.quickIconText}>
                🚗
              </Text>
            </View>

            <View style={styles.quickText}>
              <Text style={styles.quickTitle}>
                My Rides
              </Text>

              <Text style={styles.quickSubtitle}>
                Manage rides
              </Text>
            </View>

          </TouchableOpacity>


          <View style={styles.quickDivider} />


          <TouchableOpacity
            style={styles.quickItem}
            activeOpacity={0.75}
            onPress={openProfile}>

            <View style={styles.quickIcon}>
              <Text style={styles.quickIconText}>
                👤
              </Text>
            </View>

            <View style={styles.quickText}>
              <Text style={styles.quickTitle}>
                Profile
              </Text>

              <Text style={styles.quickSubtitle}>
                Account
              </Text>
            </View>

          </TouchableOpacity>

        </View>


        {/* ================================================= */}
        {/* FIND RIDE */}
        {/* ================================================= */}

        <View style={styles.sectionHeader}>

          <Text style={styles.eyebrow}>
            FIND A RIDE
          </Text>

          <View style={styles.sectionTitleRow}>

            <View style={styles.sectionTitleWrap}>

              <Text style={styles.sectionTitle}>
                Where do you want to go?
              </Text>

              <Text style={styles.sectionSubtitle}>
                Search available rides for your journey.
              </Text>

            </View>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                RIDE
              </Text>
            </View>

          </View>

        </View>


        <TouchableOpacity
          activeOpacity={0.98}
          onPress={openFindRide}>

          <LocationSearchCard />

        </TouchableOpacity>


        {/* ================================================= */}
        {/* OFFER RIDE */}
        {/* ================================================= */}

        <View style={styles.sectionHeader}>

          <Text style={styles.eyebrow}>
            SHARE THE JOURNEY
          </Text>

          <Text style={styles.sectionTitle}>
            Offer a ride
          </Text>

          <Text style={styles.sectionSubtitle}>
            Already heading somewhere? Share your empty seats
            and split the journey cost.
          </Text>

        </View>


        <RideTypeCard
          icon="🚗"
          title="Offer a Ride"
          description="Create a ride and share your empty seats."
          onPress={openOfferRide}
        />


        {/* ================================================= */}
        {/* YOUR JOURNEY */}
        {/* ================================================= */}

        <View style={styles.sectionHeader}>

          <Text style={styles.eyebrow}>
            YOUR JOURNEY
          </Text>

          <Text style={styles.sectionTitle}>
            Manage your trips
          </Text>

          <Text style={styles.sectionSubtitle}>
            Access your bookings, rides and account.
          </Text>

        </View>


        <View style={styles.sectionCard}>

          {/* MY BOOKINGS */}

          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.75}
            onPress={openBookings}>

            <View style={styles.menuIcon}>
              <Text style={styles.menuIconText}>
                📋
              </Text>
            </View>

            <View style={styles.menuTextWrap}>

              <Text style={styles.menuTitle}>
                My Bookings
              </Text>

              <Text style={styles.menuSubtitle}>
                View and manage your ride bookings.
              </Text>

            </View>

            <Text style={styles.chevron}>
              ›
            </Text>

          </TouchableOpacity>


          {/* MY RIDES */}

          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.75}
            onPress={openMyRides}>

            <View style={styles.menuIcon}>
              <Text style={styles.menuIconText}>
                🚘
              </Text>
            </View>

            <View style={styles.menuTextWrap}>

              <Text style={styles.menuTitle}>
                My Rides
              </Text>

              <Text style={styles.menuSubtitle}>
                Manage rides you have offered.
              </Text>

            </View>

            <Text style={styles.chevron}>
              ›
            </Text>

          </TouchableOpacity>


          {/* PROFILE */}

          <TouchableOpacity
            style={[styles.menuRow, styles.menuRowLast]}
            activeOpacity={0.75}
            onPress={openProfile}>

            <View style={styles.menuIcon}>
              <Text style={styles.menuIconText}>
                👤
              </Text>
            </View>

            <View style={styles.menuTextWrap}>

              <Text style={styles.menuTitle}>
                Profile & Wallet
              </Text>

              <Text style={styles.menuSubtitle}>
                Manage your account and payments.
              </Text>

            </View>

            <Text style={styles.chevron}>
              ›
            </Text>

          </TouchableOpacity>

        </View>


        {/* ================================================= */}
        {/* TRUST */}
        {/* ================================================= */}

        <View style={styles.trustCard}>

          <View style={styles.trustIcon}>
            <Text style={styles.trustIconText}>
              ✓
            </Text>
          </View>

          <View style={styles.trustContent}>

            <Text style={styles.trustTitle}>
              Travel with confidence
            </Text>

            <Text style={styles.trustSubtitle}>
              Verified community • Secure payments • Easy booking
            </Text>

          </View>

        </View>


        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <Text style={styles.footerText}>
          Go4Ryde • Travel smarter together
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
