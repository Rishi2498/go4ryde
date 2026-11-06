import React, {useEffect, useState} from 'react';

import {
  NavigationContainer,
} from '@react-navigation/native';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import {
  Text,
  View,
} from 'react-native';


// =====================================================
// AUTH SCREENS
// =====================================================

import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import VerifyScreen from '../screens/auth/VerifyScreen';


// =====================================================
// MAIN SCREENS
// =====================================================

import HomeScreen from '../screens/home/HomeScreen';
import SearchScreen from '../screens/search/SearchScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';


// =====================================================
// OTHER SCREENS
// =====================================================

import FindRideScreen from '../screens/search/FindRideScreen';


// =====================================================
// STORAGE
// =====================================================

import {getAuth} from '../services/storage';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


// =====================================================
// TAB ICON
// =====================================================

const TabIcon = ({
  symbol,
  focused,
}) => {

  return (
    <View
      style={{
        width: 42,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
      }}>

      <Text
        style={{
          fontSize: focused ? 20 : 18,
          color: focused
            ? '#A855F7'
            : '#686E83',
          fontWeight: focused
            ? '800'
            : '500',
        }}>

        {symbol}

      </Text>

    </View>
  );
};


// =====================================================
// MAIN TABS
// =====================================================

const MainTabs = () => {

  return (
    <Tab.Navigator

      screenOptions={({route}) => ({

        headerShown: false,

        tabBarShowLabel: true,

        tabBarActiveTintColor: '#A855F7',

        tabBarInactiveTintColor: '#686E83',

        tabBarStyle: {
          backgroundColor: '#0D1020',

          borderTopWidth: 1,

          borderTopColor: '#252A40',

          height: 70,

          paddingTop: 7,

          paddingBottom: 9,

          elevation: 10,

          shadowColor: '#000000',

          shadowOffset: {
            width: 0,
            height: -4,
          },

          shadowOpacity: 0.2,

          shadowRadius: 10,
        },

        tabBarLabelStyle: {
          fontSize: 10,

          fontWeight: '700',

          marginTop: 1,
        },

        tabBarIcon: ({
          focused,
        }) => {

          let symbol = '●';

          if (route.name === 'Home') {
            symbol = '⌂';
          }

          if (route.name === 'Search') {
            symbol = '⌕';
          }

          if (route.name === 'Notifications') {
            symbol = '♢';
          }

          if (route.name === 'Profile') {
            symbol = '○';
          }

          return (
            <TabIcon
              symbol={symbol}
              focused={focused}
            />
          );
        },

      })}>

      {/* =================================================
          HOME
      ================================================= */}

      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
        }}
      />


      {/* =================================================
          FIND A RIDE
      ================================================= */}

      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: 'Find a Ride',
        }}
      />


      {/* =================================================
          NOTIFICATIONS
      ================================================= */}

      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Alerts',
        }}
      />


      {/* =================================================
          PROFILE
      ================================================= */}

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
        }}
      />

    </Tab.Navigator>
  );
};


// =====================================================
// APP NAVIGATOR
// =====================================================

const AppNavigator = () => {

  const [
    checkingAuth,
    setCheckingAuth,
  ] = useState(true);

  const [
    isLoggedIn,
    setIsLoggedIn,
  ] = useState(false);


  // ===================================================
  // CHECK SAVED SESSION
  // ===================================================

  useEffect(() => {

    let mounted = true;

    const checkAuthentication = async () => {

      try {

        console.log(
          '================================',
        );

        console.log(
          'APP START: Checking saved login...',
        );

        console.log(
          '================================',
        );


        const auth = await getAuth();


        if (!mounted) {
          return;
        }


        const hasAccessToken =
          typeof auth?.access === 'string' &&
          auth.access.trim().length > 0;


        const hasRefreshToken =
          typeof auth?.refresh === 'string' &&
          auth.refresh.trim().length > 0;


        console.log(
          'Saved authentication:',
          {
            hasAccessToken,
            hasRefreshToken,
            role: auth?.role,
          },
        );


        if (hasAccessToken) {

          console.log(
            'SESSION FOUND → Opening Main',
          );

          setIsLoggedIn(true);

        } else {

          console.log(
            'NO SESSION → Opening Login',
          );

          setIsLoggedIn(false);
        }

      } catch (error) {

        console.error(
          'Authentication check failed:',
          error,
        );

        if (mounted) {
          setIsLoggedIn(false);
        }

      } finally {

        if (mounted) {
          setCheckingAuth(false);
        }

      }

    };


    checkAuthentication();


    return () => {
      mounted = false;
    };

  }, []);


  // ===================================================
  // SPLASH
  // ===================================================

  if (checkingAuth) {

    return (
      <NavigationContainer>

        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}>

          <Stack.Screen
            name="Splash"
            component={SplashScreen}
          />

        </Stack.Navigator>

      </NavigationContainer>
    );
  }


  // ===================================================
  // MAIN NAVIGATION
  // ===================================================

  return (
    <NavigationContainer>

      <Stack.Navigator

        initialRouteName={
          isLoggedIn
            ? 'Main'
            : 'Login'
        }

        screenOptions={{
          headerShown: false,

          animation: 'fade',
        }}>


        {/* =================================================
            SPLASH
        ================================================= */}

        <Stack.Screen
          name="Splash"
          component={SplashScreen}
        />


        {/* =================================================
            AUTH
        ================================================= */}

        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />

        <Stack.Screen
          name="Register"
          component={RegisterScreen}
        />

        <Stack.Screen
          name="Verify"
          component={VerifyScreen}
        />


        {/* =================================================
            MAIN APP
        ================================================= */}

        <Stack.Screen
          name="Main"
          component={MainTabs}
        />


        {/* =================================================
            FIND RIDE
        ================================================= */}

        <Stack.Screen
          name="FindRide"
          component={FindRideScreen}
        />

      </Stack.Navigator>

    </NavigationContainer>
  );
};


export default AppNavigator;