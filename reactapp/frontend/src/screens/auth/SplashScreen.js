import React, {useEffect} from 'react';
import {SafeAreaView, StatusBar, Text, View} from 'react-native';

import styles from '../../styles/SplashScreen.styles';

const SplashScreen = ({navigation}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 1800);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#00A86B"
      />

      <View style={styles.content}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>R</Text>
        </View>

        <Text style={styles.title}>
          YourRide
        </Text>

        <Text style={styles.subtitle}>
          Share the journey.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default SplashScreen;