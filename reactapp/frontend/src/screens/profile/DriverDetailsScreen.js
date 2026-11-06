import React, {useCallback, useState} from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  launchImageLibrary,
  launchCamera,
} from 'react-native-image-picker';

import {useFocusEffect} from '@react-navigation/native';

import styles from '../../styles/ProfileScreen.styles';

import {
  getMyProfile,
  updateDriverProfile,
} from '../../services/profileService';

const DriverDetailsScreen = ({navigation}) => {
  const [profile, setProfile] = useState(null);
  const [vehicleNumber, setVehicleNumber] = useState('');

  const [dlImage, setDlImage] = useState(null);
  const [rcImage, setRcImage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getMyProfile();

      setProfile(response);
      setVehicleNumber(response?.vehicle_number || '');
    } catch (error) {
      console.log('DRIVER PROFILE ERROR:', error);

      Alert.alert(
        'Unable to load',
        error?.message || 'Could not load driver details.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const pickImage = async setter => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.85,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert(
          'Image picker error',
          result.errorMessage || 'Unable to select image.',
        );
        return;
      }

      const asset = result.assets?.[0];

      if (!asset?.uri) {
        Alert.alert(
          'Image error',
          'No image was selected.',
        );
        return;
      }

      setter({
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        fileName:
          asset.fileName ||
          `image_${Date.now()}.jpg`,
      });
    } catch (error) {
      console.log('IMAGE PICKER ERROR:', error);

      Alert.alert(
        'Image error',
        error?.message || 'Unable to select image.',
      );
    }
  };

  const chooseImage = type => {
    const title =
      type === 'dl'
        ? 'Driving Licence'
        : 'Vehicle RC';

    const setter =
      type === 'dl'
        ? setDlImage
        : setRcImage;

    Alert.alert(
      title,
      'Choose how you want to add the document.',
      [
        {
          text: 'Gallery',
          onPress: () => pickImage(setter),
        },
        {
          text: 'Camera',
          onPress: async () => {
            try {
              const result = await launchCamera({
                mediaType: 'photo',
                cameraType: 'back',
                quality: 0.85,
              });

              if (result.didCancel) {
                return;
              }

              if (result.errorCode) {
                Alert.alert(
                  'Camera error',
                  result.errorMessage ||
                    'Unable to open camera.',
                );
                return;
              }

              const asset = result.assets?.[0];

              if (!asset?.uri) {
                return;
              }

              setter({
                uri: asset.uri,
                type: asset.type || 'image/jpeg',
                fileName:
                  asset.fileName ||
                  `${type}_${Date.now()}.jpg`,
              });
            } catch (error) {
              console.log('CAMERA ERROR:', error);

              Alert.alert(
                'Camera error',
                error?.message ||
                  'Unable to open camera.',
              );
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
    );
  };

  const submit = async () => {
    const vehicle = vehicleNumber.trim().toUpperCase();

    if (!vehicle) {
      Alert.alert(
        'Vehicle number required',
        'Enter your vehicle registration number.',
      );
      return;
    }

    if (!dlImage) {
      Alert.alert(
        'Driving Licence required',
        'Please select your driving licence image.',
      );
      return;
    }

    if (!rcImage) {
      Alert.alert(
        'RC required',
        'Please select your vehicle RC image.',
      );
      return;
    }

    try {
      setSaving(true);

      const response = await updateDriverProfile({
        vehicle_number: vehicle,
        dl_image: dlImage,
        rc_image: rcImage,
      });

      if (response?.profile) {
        setProfile(response.profile);
      }

      Alert.alert(
        'Submitted',
        'Your driver information and documents were submitted successfully.',
      );

      await load();
    } catch (error) {
      console.log('DRIVER SUBMIT ERROR:', error);

      let message =
        'Could not submit driver details.';

      if (error?.data?.vehicle_number) {
        message = Array.isArray(
          error.data.vehicle_number,
        )
          ? error.data.vehicle_number[0]
          : String(error.data.vehicle_number);
      } else if (error?.data?.dl_image) {
        message = Array.isArray(
          error.data.dl_image,
        )
          ? error.data.dl_image[0]
          : String(error.data.dl_image);
      } else if (error?.data?.rc_image) {
        message = Array.isArray(
          error.data.rc_image,
        )
          ? error.data.rc_image[0]
          : String(error.data.rc_image);
      } else if (error?.data?.detail) {
        message = String(error.data.detail);
      } else if (error?.data?.error) {
        message = String(error.data.error);
      } else if (error?.message) {
        message = error.message;
      }

      Alert.alert(
        'Upload failed',
        message,
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading && !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#16384A"
        />

        <Text style={styles.loadingText}>
          Loading driver details...
        </Text>
      </View>
    );
  }

  const isDriver =
    profile?.role === 'DRIVER';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">

      <View style={styles.subHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>
            ‹ Back
          </Text>
        </TouchableOpacity>

        <Text style={styles.subTitle}>
          Driver Details
        </Text>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>
          BACKEND ACCOUNT STATUS
        </Text>

        <Text style={styles.statusValue}>
          {profile?.role || 'PASSENGER'}
        </Text>

        <Text style={styles.statusDescription}>
          {isDriver
            ? 'The backend currently identifies this account as a driver.'
            : 'Submit your vehicle and document information. Verification is handled by the backend.'}
        </Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formLabel}>
          VEHICLE NUMBER
        </Text>

        <TextInput
          value={vehicleNumber}
          onChangeText={setVehicleNumber}
          style={styles.input}
          placeholder="e.g. TS09AB1234"
          placeholderTextColor="#9AA5AE"
          autoCapitalize="characters"
          editable={!saving}
        />

        <Text style={styles.formLabel}>
          DRIVING LICENCE
        </Text>

        {dlImage?.uri ? (
          <View>
            <Image
              source={{uri: dlImage.uri}}
              style={{
                width: '100%',
                height: 190,
                borderRadius: 12,
                marginBottom: 10,
                backgroundColor: '#F1F3F5',
              }}
              resizeMode="cover"
            />

            <TouchableOpacity
              style={[
                styles.uploadButton,
                styles.uploadButtonSelected,
              ]}
              onPress={() => chooseImage('dl')}
              disabled={saving}>

              <Text
                style={[
                  styles.uploadButtonText,
                  styles.uploadButtonTextSelected,
                ]}>
                Change Driving Licence
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => chooseImage('dl')}
            disabled={saving}>

            <Text style={styles.uploadButtonText}>
              Select Driving Licence
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.formLabel}>
          VEHICLE RC
        </Text>

        {rcImage?.uri ? (
          <View>
            <Image
              source={{uri: rcImage.uri}}
              style={{
                width: '100%',
                height: 190,
                borderRadius: 12,
                marginBottom: 10,
                backgroundColor: '#F1F3F5',
              }}
              resizeMode="cover"
            />

            <TouchableOpacity
              style={[
                styles.uploadButton,
                styles.uploadButtonSelected,
              ]}
              onPress={() => chooseImage('rc')}
              disabled={saving}>

              <Text
                style={[
                  styles.uploadButtonText,
                  styles.uploadButtonTextSelected,
                ]}>
                Change Vehicle RC
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => chooseImage('rc')}
            disabled={saving}>

            <Text style={styles.uploadButtonText}>
              Select Vehicle RC
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.formHint}>
          Select clear images of your original documents.
          The backend handles validation and verification.
        </Text>

        <TouchableOpacity
          style={[
            styles.primaryButton,
            saving && styles.buttonDisabled,
          ]}
          disabled={saving}
          onPress={submit}>

          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>
              Submit Driver Details
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {profile?.vehicle_number ? (
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>
            SAVED VEHICLE NUMBER
          </Text>

          <Text style={styles.infoValue}>
            {profile.vehicle_number}
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
};

export default DriverDetailsScreen;