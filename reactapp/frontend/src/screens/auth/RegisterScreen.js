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

import styles from '../../styles/RegisterScreen.styles';

import {sendOTP , registerUser,} from '../../services/authService';

const RegisterScreen = ({navigation}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [nameFocused, setNameFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const [success, setSuccess] = useState('');

  // =====================================================
  // REGISTER
  // =====================================================

  const handleRegister = async () => {
    if (loading) {
      return;
    }

    setError('');
    setSuccess('');

    // ---------------------------------------------------
    // NAME VALIDATION
    // ---------------------------------------------------

    if (!name.trim()) {
      setError('Enter your full name.');
      return;
    }

    const cleanName = name.trim();

    if (cleanName.length < 2) {
      setError('Your name must contain at least 2 characters.');
      return;
    }

    // ---------------------------------------------------
    // PHONE VALIDATION
    // ---------------------------------------------------

    if (!phone.trim()) {
      setError('Enter your phone number.');
      return;
    }

    const cleanPhone = phone
      .replace(/\D/g, '');

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError(
        'Enter a valid 10-digit Indian phone number.',
      );
      return;
    }

    // ---------------------------------------------------
    // EMAIL VALIDATION
    // ---------------------------------------------------

    if (!email.trim()) {
      setError('Enter your email address.');
      return;
    }

    const cleanEmail = email
      .trim()
      .toLowerCase();

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        cleanEmail,
      )
    ) {
      setError(
        'Please enter a valid email address.',
      );
      return;
    }

    // ---------------------------------------------------
    // SEND OTP
    // ---------------------------------------------------

    try {
      setLoading(true);

      console.log(
        'REGISTER: Sending OTP',
      );

      const response = await sendOTP(
        cleanEmail,
        'register',
      );

      console.log(
        'REGISTER OTP SUCCESS:',
        response,
      );

      // -------------------------------------------------
      // SUCCESS
      // -------------------------------------------------

      setSuccess(
        'OTP sent successfully. Check your email.',
      );

      // -------------------------------------------------
      // GO TO VERIFY
      // -------------------------------------------------

      navigation.navigate('Verify', {
        mode: 'register',
        username: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
      });

    } catch (error) {
      console.log(
        'REGISTER OTP FAILED:',
        error,
      );

      const message =
        error?.data?.error ||
        error?.data?.detail ||
        'Unable to connect to the backend.';

      setError(message);

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

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

          {/* ===========================================
              BACK BUTTON
          ============================================ */}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              navigation.goBack()
            }
            disabled={loading}
            activeOpacity={0.7}>

            <Text style={styles.backIcon}>
              ‹
            </Text>

          </TouchableOpacity>

          {/* ===========================================
              BRAND
          ============================================ */}

          <View style={styles.brand}>

            <Text style={styles.logoText}>
              GO
              <Text style={styles.logoAccent}>
                4
              </Text>
              RYDE
            </Text>

          </View>

          {/* ===========================================
              HEADER
          ============================================ */}

          <View style={styles.header}>

            <Text style={styles.eyebrow}>
              GET STARTED
            </Text>

            <Text style={styles.title}>
              Create your
              {'\n'}
              account.
            </Text>

            <Text style={styles.subtitle}>
              Join Go4Ryde and make every
              journey simpler, safer and smarter.
            </Text>

          </View>

          {/* ===========================================
              ERROR
          ============================================ */}

          {error ? (
            <View style={styles.errorBox}>

              <Text style={styles.errorText}>
                {error}
              </Text>

            </View>
          ) : null}

          {/* ===========================================
              SUCCESS
          ============================================ */}

          {success ? (
            <View style={styles.successBox}>

              <Text style={styles.successText}>
                {success}
              </Text>

            </View>
          ) : null}

          {/* ===========================================
              FORM
          ============================================ */}

          <View style={styles.form}>

            {/* =========================================
                FULL NAME
            ========================================== */}

            <Text style={styles.label}>
              FULL NAME
            </Text>

            <TextInput
              style={[
                styles.input,
                nameFocused &&
                  styles.inputFocused,
              ]}
              value={name}
              onChangeText={value => {
                setName(value);

                if (error) {
                  setError('');
                }
              }}
              placeholder="Your full name"
              placeholderTextColor="#62687C"
              autoCapitalize="words"
              autoCorrect={false}
              editable={!loading}
              onFocus={() =>
                setNameFocused(true)
              }
              onBlur={() =>
                setNameFocused(false)
              }
              returnKeyType="next"
            />

            {/* =========================================
                PHONE
            ========================================== */}

            <Text
              style={[
                styles.label,
                {
                  marginTop: 18,
                },
              ]}>

              PHONE NUMBER

            </Text>

            <TextInput
              style={[
                styles.input,
                phoneFocused &&
                  styles.inputFocused,
              ]}
              value={phone}
              onChangeText={value =>
                setPhone(
                  value
                    .replace(/\D/g, '')
                    .slice(0, 10),
                )
              }
              placeholder="9876543210"
              placeholderTextColor="#62687C"
              keyboardType="phone-pad"
              maxLength={10}
              editable={!loading}
              onFocus={() =>
                setPhoneFocused(true)
              }
              onBlur={() =>
                setPhoneFocused(false)
              }
              returnKeyType="next"
            />

            {/* =========================================
                EMAIL
            ========================================== */}

            <Text
              style={[
                styles.label,
                {
                  marginTop: 18,
                },
              ]}>

              EMAIL ADDRESS

            </Text>

            <TextInput
              style={[
                styles.input,
                emailFocused &&
                  styles.inputFocused,
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
              onFocus={() =>
                setEmailFocused(true)
              }
              onBlur={() =>
                setEmailFocused(false)
              }
              returnKeyType="done"
              onSubmitEditing={
                handleRegister
              }
            />

            {/* =========================================
                CONTINUE
            ========================================== */}

            <TouchableOpacity
              style={[
                styles.createButton,
                loading &&
                  styles.createButtonDisabled,
              ]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}>

              <Text
                style={
                  styles.createButtonText
                }>

                {loading
                  ? 'Sending code...'
                  : 'Continue'}

              </Text>

            </TouchableOpacity>

          </View>

          {/* ===========================================
              LOGIN
          ============================================ */}

          <View style={styles.loginContainer}>

            <Text style={styles.loginText}>
              Already have an account?
            </Text>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate(
                  'Login',
                )
              }
              disabled={loading}
              activeOpacity={0.7}>

              <Text style={styles.loginLink}>
                Login
              </Text>

            </TouchableOpacity>

          </View>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
};

export default RegisterScreen;