import React, {useEffect, useRef, useState} from 'react';

import {
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import styles from '../../styles/VerifyScreen.styles';

import {saveAuth} from '../../services/storage';

import {
  registerUser,
  loginUser,
  sendOTP,
} from '../../services/authService';

const RESEND_COOLDOWN = 10;
const SUCCESS_MESSAGE_TIME = 3000;

const VerifyScreen = ({navigation, route}) => {
  const [code, setCode] = useState('');

  const [loading, setLoading] = useState(false);

  const [resending, setResending] = useState(false);

  const [error, setError] = useState('');

  const [success, setSuccess] = useState(
    'OTP sent successfully. Check your email.',
  );

  const [countdown, setCountdown] = useState(0);

  const [showCooldown, setShowCooldown] = useState(false);

  const [otpFocused, setOtpFocused] = useState(false);

  const initialTimerRef = useRef(null);
  const resendTimerRef = useRef(null);

  const params = route?.params || {};

  const mode = params.mode;

  // =====================================================
  // START COOLDOWN
  // =====================================================

  const startCooldown = () => {
    setSuccess('');
    setCountdown(RESEND_COOLDOWN);
    setShowCooldown(true);
  };

  // =====================================================
  // INITIAL OTP SUCCESS MESSAGE
  // SHOW FOR 3 SECONDS
  // THEN START 10 SECOND COOLDOWN
  // =====================================================

  useEffect(() => {
    initialTimerRef.current = setTimeout(() => {
      startCooldown();
    }, SUCCESS_MESSAGE_TIME);

    return () => {
      if (initialTimerRef.current) {
        clearTimeout(initialTimerRef.current);
      }

      if (resendTimerRef.current) {
        clearTimeout(resendTimerRef.current);
      }
    };
  }, []);

  // =====================================================
  // COUNTDOWN
  // =====================================================

  useEffect(() => {
    if (!showCooldown || countdown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setCountdown(previous => {
        if (previous <= 1) {
          clearInterval(timer);
          setShowCooldown(false);

          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showCooldown, countdown]);

  // =====================================================
  // VERIFY OTP
  // =====================================================

  const handleVerify = async () => {
    if (loading || resending) {
      return;
    }

    setError('');

    if (code.length !== 6) {
      setError('Enter the 6-digit OTP.');
      return;
    }

    try {
      setLoading(true);

      let response;

      // =================================================
      // REGISTER
      // =================================================

      if (mode === 'register') {
        console.log('REGISTER: Verifying OTP');

        response = await registerUser({
          username: params.username,
          email: params.email,
          phone: params.phone,
          otp: code,
        });
      }

      // =================================================
      // LOGIN
      // =================================================

      else if (mode === 'login') {
        console.log('LOGIN: Verifying OTP');

        response = await loginUser({
          email: params.email,
          otp: code,
        });
      }

      // =================================================
      // INVALID MODE
      // =================================================

      else {
        setError('Invalid authentication mode.');
        return;
      }

      console.log('AUTH SUCCESS:', response);

      // =================================================
      // SAVE JWT
      // =================================================

      if (!response?.access || !response?.refresh) {
        throw new Error(
          'Authentication tokens were not returned by the server.',
        );
      }

      await saveAuth({
        access: response.access,
        refresh: response.refresh,
        role: response.role || 'PASSENGER',
      });

      console.log('AUTH SAVED SUCCESSFULLY');

      // =================================================
      // GO TO MAIN APP
      // =================================================

      navigation.replace('Main');

    } catch (error) {
      console.log(
        'OTP VERIFICATION FAILED:',
        error,
      );

      setError(
        error?.data?.error ||
          error?.data?.detail ||
          error?.message ||
          'Invalid or expired OTP.',
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RESEND OTP
  // =====================================================

  const handleResend = async () => {
    if (
      loading ||
      resending ||
      showCooldown
    ) {
      return;
    }

    setError('');
    setSuccess('');
    setResending(true);

    try {
      console.log(
        'SEND OTP API CALLED',
        new Date().toISOString(),
      );

      await sendOTP(
        params.email,
        mode,
      );

      console.log(
        'OTP RESENT SUCCESSFULLY',
      );

      // Clear previous OTP
      setCode('');

      // Remove focus
      setOtpFocused(false);

      // -------------------------------------------------
      // SHOW SUCCESS MESSAGE FOR 3 SECONDS
      // -------------------------------------------------

      setSuccess(
        'New OTP sent successfully. Check your email.',
      );

      // -------------------------------------------------
      // AFTER 3 SECONDS START 10 SECOND COOLDOWN
      // -------------------------------------------------

      resendTimerRef.current = setTimeout(() => {
        startCooldown();
      }, SUCCESS_MESSAGE_TIME);

    } catch (error) {
      console.log(
        'RESEND OTP ERROR:',
        error,
      );

      if (error?.status === 429) {
        setError(
          error?.data?.error ||
            'Please wait before requesting another OTP.',
        );
      } else {
        setError(
          error?.data?.error ||
            error?.data?.detail ||
            'Could not resend OTP.',
        );
      }

    } finally {
      setResending(false);
    }
  };

  // =====================================================
  // BACK
  // =====================================================

  const handleBack = () => {
    if (loading || resending) {
      return;
    }

    navigation.goBack();
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <SafeAreaView style={styles.container}>

      <StatusBar
        barStyle="light-content"
        backgroundColor="#050711"
      />

      <View style={styles.content}>

        {/* =================================================
            BACK BUTTON
        ================================================= */}

        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          disabled={loading || resending}
          activeOpacity={0.7}>

          <Text style={styles.backIcon}>
            ‹
          </Text>

        </TouchableOpacity>

        {/* =================================================
            HEADER
        ================================================= */}

        <View style={styles.header}>

          <View style={styles.iconContainer}>

            <Text style={styles.icon}>
              ✓
            </Text>

          </View>

          <Text style={styles.title}>
            Verify your email
          </Text>

          <Text style={styles.subtitle}>
            Enter the 6-digit code we sent to
            {'\n'}
            <Text
              style={{
                color: '#1C2E38',
                fontWeight: '700',
              }}>

              {params.email}

            </Text>
          </Text>

        </View>

        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

        {success ? (
          <View style={styles.successBox}>

            <View style={styles.successIcon}>

              <Text style={styles.successIconText}>
                ✓
              </Text>

            </View>

            <Text style={styles.successText}>
              {success}
            </Text>

          </View>
        ) : null}

        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {error ? (
          <View style={styles.errorBox}>

            <Text style={styles.errorText}>
              {error}
            </Text>

          </View>
        ) : null}

        {/* =================================================
            OTP INPUT
        ================================================= */}

        <TextInput
          style={[
            styles.codeInput,
            otpFocused &&
              styles.codeInputFocused,
          ]}
          value={code}
          onChangeText={value => {
            setCode(
              value
                .replace(/[^0-9]/g, '')
                .slice(0, 6),
            );

            if (error) {
              setError('');
            }
          }}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="000000"
          placeholderTextColor="#3E4356"
          textAlign="center"
          editable={
            !loading &&
            !resending
          }
          onFocus={() =>
            setOtpFocused(true)
          }
          onBlur={() =>
            setOtpFocused(false)
          }
          autoFocus={false}
        />

        {/* =================================================
            OTP HINT
        ================================================= */}

        <Text
          style={{
            color: '#686E83',
            fontSize: 12,
            textAlign: 'center',
            marginTop: 12,
          }}>

          Enter the 6-digit code to continue

        </Text>

        {/* =================================================
            VERIFY BUTTON
        ================================================= */}

        <TouchableOpacity
          style={[
            styles.verifyButton,

            code.length !== 6 &&
              styles.verifyButtonDisabled,
          ]}
          disabled={
            code.length !== 6 ||
            loading ||
            resending
          }
          onPress={handleVerify}
          activeOpacity={0.8}>

          <Text style={styles.verifyButtonText}>

            {loading
              ? 'Verifying...'
              : 'Verify'}

          </Text>

        </TouchableOpacity>

        {/* =================================================
            RESEND AREA
        ================================================= */}

        <View
          style={{
            alignItems: 'center',
            marginTop: 22,
          }}>

          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResend}
            disabled={
              loading ||
              resending ||
              showCooldown
            }
            activeOpacity={0.7}>

            <Text
              style={[
                styles.resendText,

                showCooldown && {
                  color: '#686E83',
                },
              ]}>

              {resending
                ? 'Sending new code...'
                : showCooldown
                ? `Resend code in ${countdown}s`
                : `Didn't receive a code? Resend`}

            </Text>

          </TouchableOpacity>

        </View>

        {/* =================================================
            SECURITY NOTE
        ================================================= */}

        <View
          style={{
            marginTop: 'auto',
            paddingBottom: 24,
            alignItems: 'center',
          }}>

          <Text
            style={{
              color: '#50566A',
              fontSize: 11,
              textAlign: 'center',
              lineHeight: 17,
            }}>

            Your verification code is private.
            {'\n'}
            Never share it with anyone.

          </Text>

        </View>

      </View>

    </SafeAreaView>
  );
};

export default VerifyScreen;