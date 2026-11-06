import React, {useCallback, useState} from 'react';

import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {useFocusEffect} from '@react-navigation/native';
import RazorpayCheckout from 'react-native-razorpay';

import styles from '../../styles/WalletScreen.styles';

import {
  getMyProfile,
  createWalletTopup,
  verifyWalletTopup,
  withdrawWallet,
} from '../../services/profileService';

// =====================================================
// WALLET SCREEN
// =====================================================

const WalletScreen = ({navigation}) => {
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);

  const [customAmount, setCustomAmount] = useState('');

  const [error, setError] = useState('');

  // =====================================================
  // LOAD WALLET
  // =====================================================

  const loadWallet = async (showLoading = true) => {
    try {
      setError('');

      if (showLoading) {
        setLoading(true);
      }

      const response = await getMyProfile();

      console.log(
        'WALLET PROFILE RESPONSE:',
        response,
      );

      if (response) {
        setProfile(response);
      }
    } catch (err) {
      console.log(
        'WALLET LOAD ERROR:',
        err,
      );

      const message =
        err?.data?.detail ||
        err?.data?.error ||
        err?.message ||
        'Unable to load wallet.';

      setError(String(message));
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
      loadWallet(true);
    }, []),
  );

  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = () => {
    setRefreshing(true);
    loadWallet(false);
  };

  // =====================================================
  // BALANCE
  // =====================================================

  const balance = Number(
    profile?.wallet_balance || 0,
  );

  // =====================================================
  // ADD MONEY
  // =====================================================

  const createTopup = async amount => {
    if (actionLoading) {
      return;
    }

    const numericAmount = Number(amount);

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount < 10
    ) {
      Alert.alert(
        'Invalid Amount',
        'Minimum wallet top-up is ₹10.',
      );

      return;
    }

    if (numericAmount > 100000) {
      Alert.alert(
        'Invalid Amount',
        'Maximum wallet top-up is ₹1,00,000.',
      );

      return;
    }

    try {
      setActionLoading(true);

      // -------------------------------------------------
      // STEP 1:
      // Ask Django backend to create Razorpay order
      // -------------------------------------------------

      const response = await createWalletTopup(
        numericAmount,
      );

      console.log(
        'WALLET TOPUP RESPONSE:',
        response,
      );

      /*
       * Expected backend response:
       *
       * {
       *   order_id: "...",
       *   amount: 10000,
       *   key_id: "rzp_test_..."
       * }
       *
       * amount is expected in paise.
       */

      const orderId =
        response?.order_id ||
        response?.id;

      const razorpayKey =
        response?.key_id ||
        response?.key;

      const razorpayAmount =
        Number(response?.amount) ||
        Math.round(numericAmount * 100);

      if (!orderId) {
        throw new Error(
          'Razorpay order ID was not returned by the server.',
        );
      }

      if (!razorpayKey) {
        throw new Error(
          'Razorpay key was not returned by the server.',
        );
      }

      if (
        !Number.isFinite(razorpayAmount) ||
        razorpayAmount <= 0
      ) {
        throw new Error(
          'Invalid Razorpay payment amount.',
        );
      }

      // -------------------------------------------------
      // STEP 2:
      // Open Razorpay Checkout
      // -------------------------------------------------

      const checkoutOptions = {
        description: 'Go4Ryde Wallet Top-up',
        image: 'https://razorpay.com/favicon.png',
        currency: 'INR',

        key: razorpayKey,

        amount: razorpayAmount,

        name: 'Go4Ryde',

        order_id: orderId,

        theme: {
          color: '#16384A',
        },

        prefill: {
          name:
            profile?.username ||
            profile?.name ||
            '',
          email:
            profile?.email ||
            '',
          contact:
            profile?.phone ||
            '',
        },

        notes: {
          purpose: 'wallet_topup',
        },
      };

      console.log(
        'RAZORPAY CHECKOUT OPTIONS:',
        checkoutOptions,
      );

      const paymentData =
        await RazorpayCheckout.open(
          checkoutOptions,
        );

      console.log(
        'RAZORPAY PAYMENT SUCCESS:',
        paymentData,
      );

      // -------------------------------------------------
      // STEP 3:
      // Verify payment on Django backend
      // -------------------------------------------------

      const verificationData = {
        order_id:
          paymentData?.razorpay_order_id ||
          orderId,

        payment_id:
          paymentData?.razorpay_payment_id,

        signature:
          paymentData?.razorpay_signature,
      };

      if (
        !verificationData.order_id ||
        !verificationData.payment_id ||
        !verificationData.signature
      ) {
        throw new Error(
          'Razorpay payment verification data is incomplete.',
        );
      }

      console.log(
        'WALLET PAYMENT VERIFICATION REQUEST:',
        verificationData,
      );

      const verificationResponse =
        await verifyWalletTopup(
          verificationData,
        );

      console.log(
        'WALLET PAYMENT VERIFIED:',
        verificationResponse,
      );

      // -------------------------------------------------
      // STEP 4:
      // Refresh wallet balance
      // -------------------------------------------------

      await loadWallet(false);

      setCustomAmount('');

      Alert.alert(
        'Payment Successful',
        verificationResponse?.message ||
          `₹${numericAmount.toFixed(
            2,
          )} has been added to your wallet.`,
      );
    } catch (err) {
      console.log(
        'TOPUP ERROR:',
        err,
      );

      /*
       * Razorpay cancellation usually comes through
       * as an error object. Do not show a scary
       * "payment failed" message when the user simply
       * closes the checkout screen.
       */

      const errorDescription =
        err?.description ||
        err?.error?.description ||
        '';

      const errorCode =
        err?.code ||
        err?.error?.code ||
        '';

      const isCancelled =
        String(errorDescription)
          .toLowerCase()
          .includes('cancel') ||
        String(errorDescription)
          .toLowerCase()
          .includes('dismiss') ||
        String(errorCode) === '0';

      if (isCancelled) {
        Alert.alert(
          'Payment Cancelled',
          'The wallet top-up was cancelled.',
        );

        return;
      }

      const message =
        err?.data?.detail ||
        err?.data?.error ||
        err?.message ||
        errorDescription ||
        'Unable to complete wallet top-up.';

      Alert.alert(
        'Payment Failed',
        String(message),
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // QUICK AMOUNT
  // =====================================================

  const selectAmount = amount => {
    setCustomAmount(String(amount));
  };

  // =====================================================
  // CUSTOM AMOUNT
  // =====================================================

  const addCustomMoney = () => {
    if (!customAmount.trim()) {
      Alert.alert(
        'Enter Amount',
        'Please enter an amount to add.',
      );

      return;
    }

    createTopup(
      Number(customAmount),
    );
  };

  // =====================================================
  // WITHDRAW
  // =====================================================

  const performWithdraw = async amount => {
    if (actionLoading) {
      return;
    }

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return;
    }

    if (amount > balance) {
      Alert.alert(
        'Insufficient Balance',
        'You do not have enough wallet balance.',
      );

      return;
    }

    try {
      setActionLoading(true);

      const response = await withdrawWallet(
        amount,
      );

      console.log(
        'WITHDRAW RESPONSE:',
        response,
      );

      Alert.alert(
        'Withdrawal Requested',
        response?.message ||
          `₹${amount.toFixed(
            2,
          )} withdrawal request submitted.`,
      );

      await loadWallet(false);
    } catch (err) {
      console.log(
        'WITHDRAW ERROR:',
        err,
      );

      const message =
        err?.data?.detail ||
        err?.data?.error ||
        err?.message ||
        'Unable to process withdrawal.';

      Alert.alert(
        'Withdrawal Failed',
        String(message),
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // WITHDRAW OPTIONS
  // =====================================================

  const confirmWithdraw = () => {
    if (
      !Number.isFinite(balance) ||
      balance < 10
    ) {
      Alert.alert(
        'Insufficient Balance',
        'You need at least ₹10 in your wallet to withdraw.',
      );

      return;
    }

    Alert.alert(
      'Withdraw Money',
      `Available balance: ₹${balance.toFixed(
        2,
      )}`,
      [
        {
          text: '₹500',

          onPress: () => {
            if (balance >= 500) {
              performWithdraw(500);
            } else {
              Alert.alert(
                'Insufficient Balance',
                'Your balance is less than ₹500.',
              );
            }
          },
        },

        {
          text: '₹1,000',

          onPress: () => {
            if (balance >= 1000) {
              performWithdraw(1000);
            } else {
              Alert.alert(
                'Insufficient Balance',
                'Your balance is less than ₹1,000.',
              );
            }
          },
        },

        {
          text: '₹10',

          onPress: () => {
            performWithdraw(10);
          },
        },

        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading && !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#16384A"
        />

        <Text style={styles.loadingText}>
          Loading wallet...
        </Text>
      </View>
    );
  }

  // =====================================================
  // SCREEN
  // =====================================================

  return (
    <View style={styles.screen}>

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}>

          <Text style={styles.backText}>
            ‹
          </Text>

        </TouchableOpacity>

        <View style={styles.headerTextWrap}>

          <Text style={styles.eyebrow}>
            PAYMENTS
          </Text>

          <Text style={styles.title}>
            My Wallet
          </Text>

        </View>

      </View>

      {/* ================================================= */}
      {/* CONTENT */}
      {/* ================================================= */}

      <ScrollView
        style={styles.scroll}
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

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error ? (
          <View style={styles.errorBox}>

            <Text style={styles.errorText}>
              {error}
            </Text>

            <TouchableOpacity
              onPress={() =>
                loadWallet(true)
              }>

              <Text style={styles.retryText}>
                Retry
              </Text>

            </TouchableOpacity>

          </View>
        ) : null}

        {/* ================================================= */}
        {/* BALANCE */}
        {/* ================================================= */}

        <View style={styles.balanceCard}>

          <View style={styles.balanceHeader}>

            <View>

              <Text style={styles.balanceLabel}>
                AVAILABLE BALANCE
              </Text>

              <Text style={styles.balanceTitle}>
                Go4Ryde Wallet
              </Text>

            </View>

            <View style={styles.walletIcon}>

              <Text style={styles.walletIconText}>
                ₹
              </Text>

            </View>

          </View>

          <Text style={styles.balanceAmount}>
            ₹
            {Number.isFinite(balance)
              ? balance.toFixed(2)
              : '0.00'}
          </Text>

          <Text style={styles.balanceDescription}>
            Use your wallet to pay for Go4Ryde rides.
          </Text>

        </View>

        {/* ================================================= */}
        {/* ADD MONEY */}
        {/* ================================================= */}

        <View style={styles.card}>

          <Text style={styles.sectionLabel}>
            ADD MONEY
          </Text>

          <Text style={styles.sectionTitle}>
            Add funds to your wallet
          </Text>

          <Text style={styles.sectionDescription}>
            Choose an amount or enter your own amount.
          </Text>

          {/* QUICK AMOUNTS */}

          <View style={styles.quickAmounts}>

            <TouchableOpacity
              style={styles.amountButton}
              onPress={() =>
                selectAmount(100)
              }
              activeOpacity={0.8}>

              <Text style={styles.amountButtonText}>
                ₹100
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              style={styles.amountButton}
              onPress={() =>
                selectAmount(500)
              }
              activeOpacity={0.8}>

              <Text style={styles.amountButtonText}>
                ₹500
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              style={styles.amountButton}
              onPress={() =>
                selectAmount(1000)
              }
              activeOpacity={0.8}>

              <Text style={styles.amountButtonText}>
                ₹1,000
              </Text>

            </TouchableOpacity>

          </View>

          {/* AMOUNT INPUT */}

          <View style={styles.inputWrap}>

            <Text style={styles.inputPrefix}>
              ₹
            </Text>

            <TextInput
              style={styles.input}
              value={customAmount}
              onChangeText={setCustomAmount}
              placeholder="Enter amount"
              placeholderTextColor="#9AA6AD"
              keyboardType="numeric"
              maxLength={6}
              editable={!actionLoading}
            />

          </View>

          {/* PAYMENT BUTTON */}

          <TouchableOpacity
            style={[
              styles.primaryButton,
              actionLoading &&
                styles.disabledButton,
            ]}
            onPress={addCustomMoney}
            disabled={actionLoading}
            activeOpacity={0.85}>

            {actionLoading ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <Text style={styles.primaryButtonText}>
                Continue to Payment
              </Text>
            )}

          </TouchableOpacity>

        </View>

        {/* ================================================= */}
        {/* WITHDRAW */}
        {/* ================================================= */}

        <View style={styles.card}>

          <Text style={styles.sectionLabel}>
            WITHDRAW
          </Text>

          <Text style={styles.sectionTitle}>
            Withdraw wallet balance
          </Text>

          <Text style={styles.sectionDescription}>
            Withdraw your available balance to your
            saved bank account.
          </Text>

          <View style={styles.withdrawInfo}>

            <Text style={styles.withdrawInfoLabel}>
              Available
            </Text>

            <Text style={styles.withdrawInfoAmount}>
              ₹
              {Number.isFinite(balance)
                ? balance.toFixed(2)
                : '0.00'}
            </Text>

          </View>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              (
                actionLoading ||
                !Number.isFinite(balance) ||
                balance < 10
              ) &&
                styles.disabledSecondaryButton,
            ]}
            onPress={confirmWithdraw}
            disabled={
              actionLoading ||
              !Number.isFinite(balance) ||
              balance < 10
            }
            activeOpacity={0.85}>

            <Text style={styles.secondaryButtonText}>
              Withdraw Money
            </Text>

          </TouchableOpacity>

        </View>

        {/* ================================================= */}
        {/* SECURITY */}
        {/* ================================================= */}

        <View style={styles.infoCard}>

          <Text style={styles.infoTitle}>
            Wallet Security
          </Text>

          <Text style={styles.infoText}>
            Payments are processed securely through
            Razorpay. Your wallet balance is updated
            only after successful payment verification.
          </Text>

        </View>

        <Text style={styles.footerText}>
          Go4Ryde • Wallet & Payments
        </Text>

      </ScrollView>

    </View>
  );
};

export default WalletScreen;