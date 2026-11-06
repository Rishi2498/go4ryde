import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import RazorpayCheckout from 'react-native-razorpay';

import {
  payFullBooking,
  payPartialBooking,
  payBookingFromWallet,
  payBookingByCash,
  verifyBookingPayment,
} from '../../services/paymentService';

import styles from '../../styles/PaymentScreen.styles';

const PaymentScreen = ({navigation, route}) => {
  const {bookingId, amount} = route?.params || {};

  const [selectedMethod, setSelectedMethod] = useState('FULL');
  const [partialAmount, setPartialAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  const totalAmount = Number(amount || 0);

  const handlePayment = async () => {
    if (!bookingId) {
      Alert.alert('Error', 'Booking ID is missing.');
      return;
    }

    if (processing) {
      return;
    }

    if (selectedMethod === 'PARTIAL') {
      const enteredAmount = Number(partialAmount);

      if (!enteredAmount || enteredAmount <= 0) {
        Alert.alert(
          'Invalid Amount',
          'Please enter a valid partial payment amount.',
        );
        return;
      }

      if (totalAmount > 0 && enteredAmount >= totalAmount) {
        Alert.alert(
          'Invalid Amount',
          'Partial payment must be less than the total booking amount.',
        );
        return;
      }
    }

    try {
      setProcessing(true);

      let response;

      // =========================================================
      // WALLET PAYMENT
      // =========================================================
      if (selectedMethod === 'WALLET') {
        response = await payBookingFromWallet(bookingId);

        console.log('💰 WALLET PAYMENT RESPONSE:', response);

        Alert.alert(
          'Payment Successful',
          response?.message ||
            'Your booking has been paid using your wallet.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('MyBookings'),
            },
          ],
        );

        return;
      }

      // =========================================================
      // CASH / COD
      // =========================================================
      if (selectedMethod === 'COD') {
        response = await payBookingByCash(bookingId);

        console.log('💵 CASH PAYMENT RESPONSE:', response);

        Alert.alert(
          'Cash Payment Selected',
          response?.message ||
            'Cash payment has been selected for this booking.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('MyBookings'),
            },
          ],
        );

        return;
      }

      // =========================================================
      // FULL RAZORPAY PAYMENT
      // =========================================================
      if (selectedMethod === 'FULL') {
response = await payFullBooking(
  bookingId,
  totalAmount,
);      }

      // =========================================================
      // PARTIAL RAZORPAY PAYMENT
      // =========================================================
      if (selectedMethod === 'PARTIAL') {
        response = await payPartialBooking(
          bookingId,
          Number(partialAmount),
        );
      }

      console.log('💳 PAYMENT CREATE RESPONSE:', response);

      const orderId = response?.order_id;
      const razorpayKey = response?.key;
      const razorpayAmount = response?.amount;
      const currency = response?.currency || 'INR';

      if (!orderId) {
        throw new Error(
          response?.error ||
            response?.message ||
            'Payment order was not created.',
        );
      }

      if (!razorpayKey) {
        throw new Error('Razorpay key was not returned by the server.');
      }

      if (!razorpayAmount) {
        throw new Error('Payment amount was not returned by the server.');
      }

      // =========================================================
      // OPEN RAZORPAY
      // =========================================================
      const options = {
        description:
          selectedMethod === 'PARTIAL'
            ? 'Go4Ryde Partial Booking Payment'
            : 'Go4Ryde Booking Payment',

        image: undefined,

        currency,

        key: razorpayKey,

        amount: Number(razorpayAmount),

        name: 'Go4Ryde',

        order_id: orderId,

        prefill: {
          email: '',
          contact: '',
          name: '',
        },

        theme: {
          color: '#111827',
        },
      };

      console.log('🚀 OPENING RAZORPAY:', options);

      let razorpayResponse;

      try {
        razorpayResponse =
          await RazorpayCheckout.open(options);
      } catch (razorpayError) {
        console.log(
          '❌ RAZORPAY ERROR:',
          razorpayError,
        );

        if (
          razorpayError?.code === 2 ||
          razorpayError?.description
            ?.toLowerCase()
            ?.includes('cancel')
        ) {
          Alert.alert(
            'Payment Cancelled',
            'You cancelled the payment.',
          );
          return;
        }

        throw razorpayError;
      }

      console.log(
        '✅ RAZORPAY SUCCESS:',
        razorpayResponse,
      );

      const paymentId =
        razorpayResponse?.razorpay_payment_id;

      const returnedOrderId =
        razorpayResponse?.razorpay_order_id;

      const signature =
        razorpayResponse?.razorpay_signature;

      if (
        !paymentId ||
        !returnedOrderId ||
        !signature
      ) {
        throw new Error(
          'Razorpay payment verification details are missing.',
        );
      }

      // =========================================================
      // VERIFY PAYMENT WITH DJANGO
      // =========================================================
      const verifyResponse =
        await verifyBookingPayment({
          orderId: returnedOrderId,
          paymentId,
          signature,
        });

      console.log(
        '🔐 PAYMENT VERIFY RESPONSE:',
        verifyResponse,
      );

      Alert.alert(
        'Payment Successful',
        verifyResponse?.message ||
          'Your payment has been verified successfully.',
        [
          {
            text: 'OK',
            onPress: () =>
              navigation.navigate('MyBookings'),
          },
        ],
      );
    } catch (error) {
      console.log(
        '❌ PAYMENT ERROR:',
        error,
      );

      const message =
        error?.message ||
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        'Payment could not be completed.';

      Alert.alert('Payment Failed', message);
    } finally {
      setProcessing(false);
    }
  };

  const selectMethod = method => {
    if (processing) {
      return;
    }

    setSelectedMethod(method);

    if (method !== 'PARTIAL') {
      setPartialAmount('');
    }
  };

  const renderPaymentMethod = (
    method,
    title,
    subtitle,
    icon,
  ) => {
    const selected = selectedMethod === method;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        disabled={processing}
        onPress={() => selectMethod(method)}
        style={[
          styles.methodCard,
          selected && styles.methodCardSelected,
        ]}>
        <View style={styles.methodIcon}>
          <Text style={styles.methodIconText}>
            {icon}
          </Text>
        </View>

        <View style={styles.methodContent}>
          <Text style={styles.methodTitle}>
            {title}
          </Text>

          <Text style={styles.methodSubtitle}>
            {subtitle}
          </Text>
        </View>

        <View
          style={[
            styles.radioOuter,
            selected && styles.radioOuterSelected,
          ]}>
          {selected ? (
            <View style={styles.radioInner} />
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.scrollContent
          }>
          
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.eyebrow}>
              GO4RYDE
            </Text>

            <Text style={styles.title}>
              Payment
            </Text>

            <Text style={styles.subtitle}>
              Choose how you want to pay for
              your ride.
            </Text>
          </View>

          {/* BOOKING SUMMARY */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Booking ID
              </Text>

              <Text style={styles.summaryValue}>
                #{bookingId || '--'}
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Total Amount
              </Text>

              <Text style={styles.amountValue}>
                ₹
                {totalAmount > 0
                  ? totalAmount.toFixed(2)
                  : '0.00'}
              </Text>
            </View>
          </View>

          {/* PAYMENT METHODS */}
          <Text style={styles.sectionTitle}>
            Choose Payment Method
          </Text>

          {renderPaymentMethod(
            'FULL',
            'Pay Full Amount',
            'Pay the complete booking amount online',
            '₹',
          )}

          {/* {renderPaymentMethod(
            'PARTIAL',
            'Pay Partial Amount',
            'Pay a part of the booking amount online',
            '◐',
          )}

          {selectedMethod === 'PARTIAL' ? (
            <View style={styles.partialBox}>
              <Text style={styles.inputLabel}>
                Partial Payment Amount
              </Text>

              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>
                  ₹
                </Text>

                <TextInput
                  value={partialAmount}
                  onChangeText={setPartialAmount}
                  keyboardType="decimal-pad"
                  placeholder="Enter amount"
                  placeholderTextColor="#9CA3AF"
                  editable={!processing}
                  style={styles.amountInput}
                />
              </View>

              <Text style={styles.inputHint}>
                Amount must be less than the total
                booking amount.
              </Text>
            </View>
          ) : null} */}

          {renderPaymentMethod(
            'WALLET',
            'Pay from Wallet',
            'Use your Go4Ryde wallet balance',
            '▣',
          )}

          {renderPaymentMethod(
            'COD',
            'Pay Cash',
            'Pay the driver in cash',
            '💵',
          )}

          {/* PAYMENT INFORMATION */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>
              ℹ
            </Text>

            <View style={styles.infoContent}>
              {selectedMethod === 'FULL' ? (
                <>
                  <Text style={styles.infoTitle}>
                    Full Online Payment
                  </Text>

                  <Text style={styles.infoText}>
                    You will be redirected to
                    Razorpay to complete the
                    payment securely.
                  </Text>
                </>
              ) : null}

              {/* {selectedMethod === 'PARTIAL' ? (
                <>
                  <Text style={styles.infoTitle}>
                    Partial Online Payment
                  </Text>

                  <Text style={styles.infoText}>
                    The amount you enter will be
                    processed through Razorpay.
                  </Text>
                </>
              ) : null} */}

              {selectedMethod === 'WALLET' ? (
                <>
                  <Text style={styles.infoTitle}>
                    Wallet Payment
                  </Text>

                  <Text style={styles.infoText}>
                    The booking amount will be
                    deducted directly from your
                    Go4Ryde wallet.
                  </Text>
                </>
              ) : null}

              {selectedMethod === 'COD' ? (
                <>
                  <Text style={styles.infoTitle}>
                    Cash Payment
                  </Text>

                  <Text style={styles.infoText}>
                    Your booking will be recorded
                    as a cash payment. Pay the
                    driver directly according to
                    the ride terms.
                  </Text>
                </>
              ) : null}
            </View>
          </View>

          {/* PAY BUTTON */}
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={processing}
            onPress={handlePayment}
            style={[
              styles.payButton,
              processing &&
                styles.payButtonDisabled,
            ]}>
            {processing ? (
              <>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.payButtonText
                  }>
                  Processing...
                </Text>
              </>
            ) : (
              <Text
                style={styles.payButtonText}>
                {selectedMethod === 'FULL'
                  ? 'Pay Full Amount'
                 //  : selectedMethod ===
                  //   'PARTIAL'
                  // ? 'Pay Partial Amount'
                  : selectedMethod ===
                    'WALLET'
                  ? 'Pay from Wallet'
                  : 'Select Cash Payment'}
              </Text>
            )}
          </TouchableOpacity>

          {/* SECURITY */}
          <View style={styles.securityBox}>
            <Text style={styles.securityIcon}>
              🔒
            </Text>

            <Text style={styles.securityText}>
              Online payments are processed
              securely through Razorpay.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PaymentScreen;