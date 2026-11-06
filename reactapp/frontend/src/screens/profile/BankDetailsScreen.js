import React, {useState} from 'react';

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import styles from '../../styles/ProfileScreen.styles';

import {saveBankAccount} from '../../services/profileService';

const BankDetailsScreen = ({navigation}) => {
  const [bankName, setBankName] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (
      !bankName.trim() ||
      !accountHolder.trim() ||
      !accountNumber.trim() ||
      !ifsc.trim()
    ) {
      Alert.alert(
        'Missing details',
        'Please fill all bank fields.',
      );
      return;
    }

    try {
      setSaving(true);

      /*
       * These are common bank-account field names. If your
       * save_bank_account serializer uses different names,
       * change ONLY this object to match that serializer.
       */
      const response = await saveBankAccount({
        bank_name: bankName.trim(),
        account_holder_name: accountHolder.trim(),
        account_number: accountNumber.trim(),
        ifsc_code: ifsc.trim().toUpperCase(),
      });

      Alert.alert(
        'Bank details saved',
        response?.message ||
          'Bank account details were submitted successfully.',
      );
    } catch (error) {
      Alert.alert(
        'Unable to save',
        error?.message ||
          'Could not save bank account details.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">

      <View style={styles.subHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.subTitle}>
          Bank Details
        </Text>
      </View>

      <View style={styles.noticeCard}>
        <Text style={styles.noticeTitle}>
          Withdrawal account
        </Text>
        <Text style={styles.noticeText}>
          These details are used for wallet withdrawal. Keep your
          account information accurate.
        </Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formLabel}>
          BANK NAME
        </Text>

        <TextInput
          value={bankName}
          onChangeText={setBankName}
          style={styles.input}
          placeholder="Bank name"
          placeholderTextColor="#9AA5AE"
        />

        <Text style={styles.formLabel}>
          ACCOUNT HOLDER NAME
        </Text>

        <TextInput
          value={accountHolder}
          onChangeText={setAccountHolder}
          style={styles.input}
          placeholder="Account holder name"
          placeholderTextColor="#9AA5AE"
        />

        <Text style={styles.formLabel}>
          ACCOUNT NUMBER
        </Text>

        <TextInput
          value={accountNumber}
          onChangeText={setAccountNumber}
          style={styles.input}
          placeholder="Account number"
          placeholderTextColor="#9AA5AE"
          keyboardType="number-pad"
          secureTextEntry
        />

        <Text style={styles.formLabel}>
          IFSC CODE
        </Text>

        <TextInput
          value={ifsc}
          onChangeText={setIfsc}
          style={styles.input}
          placeholder="IFSC code"
          placeholderTextColor="#9AA5AE"
          autoCapitalize="characters"
        />

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
              Save Bank Details
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default BankDetailsScreen;
