
import React, {useCallback, useEffect, useState} from 'react';

import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {useFocusEffect} from '@react-navigation/native';

import styles from '../../styles/ProfileScreen.styles';

import {getMyProfile} from '../../services/profileService';

import {
  getUser,
  saveUser,
  clearAuth,
} from '../../services/storage';

const ProfileScreen = ({navigation}) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // =========================================================
  // LOAD PROFILE
  // =========================================================

  const loadProfile = async (showLoading = true) => {
    try {
      setError('');

      if (showLoading) {
        setLoading(true);
      }

      // Cached profile
      try {
        const cachedUser = await getUser();

        if (cachedUser) {
          setProfile(cachedUser);
        }
      } catch (cacheError) {
        console.log('CACHE PROFILE ERROR:', cacheError);
      }

      // Backend profile
      const response = await getMyProfile();

      console.log('PROFILE RESPONSE:', response);

      if (response) {
        setProfile(response);

        try {
          await saveUser(response);
        } catch (saveError) {
          console.log('SAVE USER ERROR:', saveError);
        }
      }
    } catch (err) {
      console.log('PROFILE ERROR:', err);

      const message =
        err?.data?.detail ||
        err?.data?.error ||
        err?.message ||
        'Unable to load profile.';

      setError(String(message));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadProfile(true);
  }, []);

  // =========================================================
  // REFRESH ON SCREEN FOCUS
  // =========================================================

  useFocusEffect(
    useCallback(() => {
      loadProfile(false);
    }, []),
  );

  // =========================================================
  // PULL TO REFRESH
  // =========================================================

  const handleRefresh = () => {
    setRefreshing(true);
    loadProfile(false);
  };

  // =========================================================
  // NAVIGATION
  // =========================================================

  const openEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const openDriverDetails = () => {
    navigation.navigate('DriverDetails');
  };

  const openBankDetails = () => {
    navigation.navigate('BankDetails');
  };

  const openWallet = () => {
    navigation.navigate('Wallet');
  };

  const openMyRides = () => {
    navigation.navigate('MyRides');
  };

  const openMyBookings = () => {
    navigation.navigate('MyBookings');
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAuth();

              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: 'Login',
                  },
                ],
              });
            } catch (err) {
              console.log('LOGOUT ERROR:', err);
            }
          },
        },
      ],
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading && !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#16384A"
        />

        <Text style={styles.loadingText}>
          Loading profile...
        </Text>
      </View>
    );
  }

  // =========================================================
  // PROFILE VALUES
  // =========================================================

  const username =
    profile?.username ||
    profile?.email?.split('@')[0] ||
    'User';

  const email =
    profile?.email || 'No email';

  const phone =
    profile?.phone || 'No phone number';

  const role =
    profile?.role || 'PASSENGER';

  const balance = Number(
    profile?.wallet_balance || 0,
  );

  const isDriver =
    role === 'DRIVER';

  const vehicleNumber =
    profile?.vehicle_number || null;

  const bankAccount =
    profile?.bank_account || null;

  const initials =
    username
      .trim()
      .charAt(0)
      .toUpperCase() || 'U';

  // =========================================================
  // SCREEN
  // =========================================================

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#16384A']}
          tintColor="#16384A"
        />
      }>

      {/* HEADER */}

      <View style={styles.header}>
        <Text style={styles.eyebrow}>
          ACCOUNT
        </Text>

        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.title}>
              Profile
            </Text>

            <Text style={styles.subtitle}>
              Manage your Go4Ryde account.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.editHeaderButton}
            onPress={openEditProfile}
            activeOpacity={0.8}>

            <Text style={styles.editHeaderText}>
              Edit
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ERROR */}

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            {error}
          </Text>

          <TouchableOpacity
            onPress={() => loadProfile(true)}>

            <Text style={styles.retryText}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* PROFILE CARD */}

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {initials}
          </Text>
        </View>

        <Text style={styles.username}>
          {username}
        </Text>

        <Text style={styles.email}>
          {email}
        </Text>

        <Text style={styles.phone}>
          {phone}
        </Text>

        <View
          style={[
            styles.roleBadge,
            isDriver && styles.driverRoleBadge,
          ]}>

          <Text
            style={[
              styles.roleBadgeText,
              isDriver &&
                styles.driverRoleBadgeText,
            ]}>

            {role}

          </Text>
        </View>
      </View>

      {/* PERSONAL DETAILS */}

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          PERSONAL DETAILS
        </Text>

        <TouchableOpacity
          style={styles.menuRow}
          onPress={openEditProfile}
          activeOpacity={0.75}>

          <View style={styles.menuIcon}>
            <Text style={styles.menuIconText}>
              👤
            </Text>
          </View>

          <View style={styles.menuTextWrap}>
            <Text style={styles.menuTitle}>
              Edit Profile
            </Text>

            <Text style={styles.menuSubtitle}>
              {username} • {phone}
            </Text>
          </View>

          <Text style={styles.chevron}>
            ›
          </Text>
        </TouchableOpacity>
      </View>

      {/* BOOKINGS */}

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          BOOKINGS
        </Text>

        <TouchableOpacity
          style={styles.menuRow}
          onPress={openMyBookings}
          activeOpacity={0.75}>

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
      </View>

      {/* PAYMENTS */}

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          PAYMENTS
        </Text>

        <TouchableOpacity
          style={styles.menuRow}
          onPress={openWallet}
          activeOpacity={0.75}>

          <View style={styles.menuIcon}>
            <Text style={styles.menuIconText}>
              ₹
            </Text>
          </View>

          <View style={styles.menuTextWrap}>
            <Text style={styles.menuTitle}>
              Wallet
            </Text>

            <Text style={styles.menuSubtitle}>
              Balance • ₹
              {Number.isFinite(balance)
                ? balance.toFixed(2)
                : '0.00'}
            </Text>
          </View>

          <Text style={styles.chevron}>
            ›
          </Text>
        </TouchableOpacity>
      </View>

      {/* BANK DETAILS */}

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          BANK DETAILS
        </Text>

        <TouchableOpacity
          style={styles.menuRow}
          onPress={openBankDetails}
          activeOpacity={0.75}>

          <View style={styles.menuIcon}>
            <Text style={styles.menuIconText}>
              🏦
            </Text>
          </View>

          <View style={styles.menuTextWrap}>
            <Text style={styles.menuTitle}>
              {bankAccount?.bank_name ||
                'Add Bank Account'}
            </Text>

            <Text style={styles.menuSubtitle}>
              {bankAccount?.account_number
                ? `Account ••••${String(
                    bankAccount.account_number,
                  ).slice(-4)}`
                : 'Required for wallet withdrawals.'}
            </Text>
          </View>

          <Text style={styles.chevron}>
            ›
          </Text>
        </TouchableOpacity>
      </View>

      {/* DRIVER */}

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          DRIVER
        </Text>

        {isDriver ? (
          <TouchableOpacity
            style={styles.menuRow}
            onPress={openMyRides}
            activeOpacity={0.75}>

            <View style={styles.menuIcon}>
              <Text style={styles.menuIconText}>
                🚗
              </Text>
            </View>

            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>
                My Rides
              </Text>

              <Text style={styles.menuSubtitle}>
                Manage your rides and passenger
                booking requests.
              </Text>
            </View>

            <Text style={styles.chevron}>
              ›
            </Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.menuRow}
          onPress={openDriverDetails}
          activeOpacity={0.75}>

          <View style={styles.menuIcon}>
            <Text style={styles.menuIconText}>
              🚘
            </Text>
          </View>

          <View style={styles.menuTextWrap}>
            <Text style={styles.menuTitle}>
              {isDriver
                ? 'Driver Details'
                : 'Become a Driver'}
            </Text>

            <Text style={styles.menuSubtitle}>
              {isDriver
                ? vehicleNumber
                  ? `Vehicle • ${vehicleNumber}`
                  : 'Manage your driver information.'
                : 'Submit vehicle and document details.'}
            </Text>
          </View>

          <Text style={styles.chevron}>
            ›
          </Text>
        </TouchableOpacity>

        <View style={styles.verificationBox}>
          <Text style={styles.verificationLabel}>
            BACKEND STATUS
          </Text>

          <Text style={styles.verificationText}>
            {isDriver
              ? 'Your account is currently marked as DRIVER.'
              : 'Your account is currently marked as PASSENGER. Driver verification is controlled by the backend.'}
          </Text>
        </View>
      </View>

      {/* DRIVER DOCUMENTS */}

      {isDriver ? (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            DOCUMENTS
          </Text>

          <View style={styles.menuRow}>
            <View style={styles.menuIcon}>
              <Text style={styles.menuIconText}>
                🪪
              </Text>
            </View>

            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>
                Driving Licence
              </Text>

              <Text style={styles.menuSubtitle}>
                {profile?.dl_image
                  ? 'Document uploaded'
                  : 'Document not uploaded'}
              </Text>
            </View>

            <Text
              style={[
                styles.documentStatusText,
                profile?.dl_image
                  ? styles.documentUploaded
                  : styles.documentMissing,
              ]}>

              {profile?.dl_image
                ? 'UPLOADED'
                : 'MISSING'}

            </Text>
          </View>

          <View style={styles.menuRow}>
            <View style={styles.menuIcon}>
              <Text style={styles.menuIconText}>
                📄
              </Text>
            </View>

            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>
                Vehicle RC
              </Text>

              <Text style={styles.menuSubtitle}>
                {profile?.rc_image
                  ? 'Document uploaded'
                  : 'Document not uploaded'}
              </Text>
            </View>

            <Text
              style={[
                styles.documentStatusText,
                profile?.rc_image
                  ? styles.documentUploaded
                  : styles.documentMissing,
              ]}>

              {profile?.rc_image
                ? 'UPLOADED'
                : 'MISSING'}

            </Text>
          </View>
        </View>
      ) : null}

      {/* LOGOUT */}

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.85}>

        <Text style={styles.logoutText}>
          Logout
        </Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Go4Ryde • Account & Payments
      </Text>

    </ScrollView>
  );
};

export default ProfileScreen;
