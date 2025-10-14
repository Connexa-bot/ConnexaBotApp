import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import AppNavigator from './AppNavigator';
import LinkDeviceScreen from '../screens/LinkDeviceScreen';
import WelcomeSplashScreen from '../screens/WelcomeSplashScreen';
import TermsPrivacyScreen from '../screens/TermsPrivacyScreen';
import AppSplashScreen from '../screens/AppSplashScreen';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { storage } from '../utils/storage';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, loading, connectionStatus } = useAuth();
  const { colors, isDark } = useTheme();
  const [showWelcomeSplash, setShowWelcomeSplash] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [appSplashComplete, setAppSplashComplete] = useState(false);

  useEffect(() => {
    if (!loading && !initialCheckDone) {
      setInitialCheckDone(true);
      // Only show welcome splash if no user session exists
      if (!user) {
        setShowWelcomeSplash(true);
      }
    }
  }, [loading, user, initialCheckDone]);

  // Show app splash while checking session AND until splash animation completes
  if (loading || !initialCheckDone || !appSplashComplete) {
    return <AppSplashScreen onComplete={() => setAppSplashComplete(true)} />;
  }

  // Show welcome splash only for new users (no session)
  if (!user && showWelcomeSplash) {
    return <WelcomeSplashScreen onComplete={() => setShowWelcomeSplash(false)} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={AppNavigator} />
        ) : (
          <>
            <Stack.Screen name="TermsPrivacy">
              {({ navigation }) => (
                <TermsPrivacyScreen onContinue={() => navigation.navigate('LinkDevice')} />
              )}
            </Stack.Screen>
            <Stack.Screen name="LinkDevice" component={LinkDeviceScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}