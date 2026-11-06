import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {getMyProfile, updateProfile} from '../../services/profileService';
import {getUser, updateUser} from '../../services/storage';
import styles from '../../styles/ProfileScreen.styles';

const EditProfileScreen = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const cachedUser = await getUser();

      if (cachedUser) {
        setUsername(cachedUser.username || '');
        setPhone(cachedUser.phone || '');
        setEmail(cachedUser.email || '');
      }

      const profile = await getMyProfile();

      if (profile) {
        setUsername(profile.username || '');
        setPhone(profile.phone || '');
        setEmail(profile.email || '');
      }
    } catch (error) {
      console.log('LOAD PROFILE ERROR:', error);

      Alert.alert(
        'Unable to load profile',
        error?.message || 'Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const cleanUsername = username.trim();
    const cleanPhone = phone.trim();

    if (!cleanUsername) {
      Alert.alert('Validation', 'Username is required.');
      return false;
    }

    if (cleanUsername.length < 3) {
      Alert.alert(
        'Validation',
        'Username must contain at least 3 characters.',
      );
      return false;
    }

    if (!cleanPhone) {
      Alert.alert('Validation', 'Phone number is required.');
      return false;
    }

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      Alert.alert(
        'Validation',
        'Enter a valid 10-digit Indian phone number.',
      );
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setSaving(true);

      const cleanUsername = username.trim();
      const cleanPhone = phone.trim();

      const response = await updateProfile({
        username: cleanUsername,
        phone: cleanPhone,
      });

      // Cache updated profile locally
      await updateUser({
        username: response?.username || cleanUsername,
        phone: response?.phone || cleanPhone,
        email: response?.email || email,
        role: response?.role,
      });

      Alert.alert(
        'Profile Updated',
        'Your profile has been updated successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error) {
      console.log('UPDATE PROFILE ERROR:', error);

      let message = 'Unable to update your profile.';

      if (error?.data?.username) {
        message = Array.isArray(error.data.username)
          ? error.data.username[0]
          : String(error.data.username);
      } else if (error?.data?.phone) {
        message = Array.isArray(error.data.phone)
          ? error.data.phone[0]
          : String(error.data.phone);
      } else if (error?.data?.detail) {
        message = String(error.data.detail);
      } else if (error?.data?.error) {
        message = String(error.data.error);
      } else if (error?.message) {
        message = error.message;
      }

      Alert.alert('Update Failed', message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#16384A"
          />
          <Text style={styles.loadingText}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled">
          
          <View style={styles.header}>
            <Text style={styles.eyebrow}>ACCOUNT</Text>

            <Text style={styles.title}>
              Edit Profile
            </Text>

            <Text style={styles.subtitle}>
              Update your personal information.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>
              Username
            </Text>

            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              placeholderTextColor="#8A98A2"
              autoCapitalize="words"
              style={styles.input}
              editable={!saving}
            />

            <View style={styles.divider} />

            <Text style={styles.infoLabel}>
              Email
            </Text>

            <View style={styles.inputDisabled}>
              <Text style={styles.disabledText}>
                {email || 'Not available'}
              </Text>
            </View>

            <Text style={styles.helperText}>
              Email is linked to your account and cannot be changed here.
            </Text>

            <View style={styles.divider} />

            <Text style={styles.infoLabel}>
              Phone
            </Text>

            <TextInput
              value={phone}
              onChangeText={value =>
                setPhone(value.replace(/\D/g, '').slice(0, 10))
              }
              placeholder="10-digit phone number"
              placeholderTextColor="#8A98A2"
              keyboardType="phone-pad"
              maxLength={10}
              style={styles.input}
              editable={!saving}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.actionButton,
              saving && styles.driverButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}>
            {saving ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <Text style={styles.actionButtonText}>
                Save Changes
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => navigation.goBack()}
            disabled={saving}
            activeOpacity={0.8}>
            <Text style={styles.logoutText}>
              Cancel
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;