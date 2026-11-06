import React, {useState} from 'react';

import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import styles from '../../styles/LoginScreen.styles';
import {sendOTP} from '../../services/authService';

const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ==========================================
  // LOGIN
  // ==========================================

  const handleLogin = async () => {
    if (loading) {
      return;
    }

    setError('');
    setSuccess('');

    // ==========================================
    // EMAIL REQUIRED
    // ==========================================

    if (!email.trim()) {
      setError('Enter your email address.');
      return;
    }

    // ==========================================
    // CLEAN EMAIL
    // ==========================================

    const cleanEmail = email.trim().toLowerCase();

    // ==========================================
    // EMAIL VALIDATION
    // ==========================================

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    // ==========================================
    // SEND OTP
    // ==========================================

    try {
      setLoading(true);

      console.log('LOGIN: Sending OTP to:', cleanEmail);

      const response = await sendOTP(cleanEmail, 'login');

      console.log('LOGIN OTP SUCCESS:', response);

      setSuccess('OTP sent successfully. Check your email.');

      // Small delay so success state can update
      setTimeout(() => {
        navigation.navigate('Verify', {
          mode: 'login',
          email: cleanEmail,
        });
      }, 300);

    } catch (error) {
      console.log('LOGIN OTP FAILED:', error);

      let message =
        error?.data?.error ||
        error?.data?.detail ||
        error?.message ||
        'Unable to connect to the backend.';

      // Account does not exist
      if (
        error?.status === 404 &&
        error?.data?.redirect === 'register'
      ) {
        message =
          'Account not found. Please register first.';
      }

      // Rate limit
      if (error?.status === 429) {
        message =
          'Too many OTP requests. Please wait a moment before trying again.';
      }

      setError(message);

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* ======================================
              BRAND
          ======================================= */}

          <View style={styles.brand}>
            <View style={styles.logoMark}>
              <Text style={styles.logoCar}>
                ⌁
              </Text>
            </View>

            <Text style={styles.logoText}>
              GO
              <Text style={styles.logoAccent}>
                4
              </Text>
              RYDE
            </Text>
          </View>

          {/* ======================================
              HEADER
          ======================================= */}

          <View style={styles.header}>
            <Text style={styles.eyebrow}>
              WELCOME BACK
            </Text>

            <Text style={styles.title}>
              Ready for your
              {'\n'}
              next ride?
            </Text>

            <Text style={styles.subtitle}>
              Enter your email and we'll send
              you a secure login code.
            </Text>
          </View>

          {/* ======================================
              ERROR
          ======================================= */}

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>
                {error}
              </Text>
            </View>
          ) : null}

          {/* ======================================
              SUCCESS
          ======================================= */}

          {success ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>
                {success}
              </Text>
            </View>
          ) : null}

          {/* ======================================
              FORM
          ======================================= */}

          <View style={styles.form}>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                EMAIL ADDRESS
              </Text>

              <TextInput
                style={[
                  styles.input,
                  emailFocused && styles.inputFocused,
                ]}
                value={email}
                onChangeText={value => {
                  setEmail(value);

                  if (error) {
                    setError('');
                  }
                }}
                placeholder="you@example.com"
                placeholderTextColor="#62687C"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
            </View>

            {/* ====================================
                CONTINUE BUTTON
            ===================================== */}

            <TouchableOpacity
              style={[
                styles.loginButton,
                loading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}>

              <Text style={styles.loginButtonText}>
                {loading
                  ? 'Sending code...'
                  : 'Continue'}
              </Text>

            </TouchableOpacity>

          </View>

          {/* ======================================
              REGISTER
          ======================================= */}

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              Don't have an account?
            </Text>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Register')
              }
              disabled={loading}
              activeOpacity={0.7}>

              <Text style={styles.registerLink}>
                Register
              </Text>

            </TouchableOpacity>
          </View>

        </ScrollView>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;