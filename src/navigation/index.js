import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import AppNavigator from './AppNavigator';
import LinkDeviceScreen from '../screens/LinkDeviceScreen';
import WelcomeSplashScreen from '../screens/WelcomeSplashScreen';
import TermsPrivacyScreen from '../screens/TermsPrivacyScreen';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { storage } from '../utils/storage';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, loading } = useAuth();
  const { colors, isDark } = useTheme();
  const [showWelcome, setShowWelcome] = useState(true);
  const [showTerms, setShowTerms] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);

  useEffect(() => {
    checkWelcomeStatus();
  }, []);

  const checkWelcomeStatus = async () => {
    try {
      const seen = await storage.getItem('hasSeenWelcome');
      if (seen === 'true') {
        setShowWelcome(false);
        setHasSeenWelcome(true);
      }
    } catch (error) {
      console.error('Error checking welcome status:', error);
    }
  };

  const handleWelcomeComplete = async () => {
    console.log('🔵 [NAV] Welcome complete, showing terms');
    setShowWelcome(false);
    setShowTerms(true);
  };

  const handleTermsAccept = async () => {
    console.log('🔵 [NAV] Terms accepted, saving to storage');
    try {
      await storage.setItem('hasSeenWelcome', 'true');
      console.log('🔵 [NAV] Storage saved, updating state');
      setShowTerms(false);
      setHasSeenWelcome(true);
      console.log('🔵 [NAV] State updated, should show main app');
    } catch (error) {
      console.error('Error saving welcome status:', error);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (showWelcome) {
    console.log('🔵 [NAV] Rendering WelcomeSplashScreen');
    return (
      <>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <WelcomeSplashScreen onComplete={handleWelcomeComplete} />
      </>
    );
  }

  if (showTerms) {
    console.log('🔵 [NAV] Rendering TermsPrivacyScreen');
    return (
      <>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <TermsPrivacyScreen onContinue={handleTermsAccept} />
      </>
    );
  }
  
  console.log('🔵 [NAV] Rendering main navigation, user:', user ? 'logged in' : 'not logged in');

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.header} />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <Stack.Screen name="App" component={AppNavigator} />
          ) : (
            <Stack.Screen name="LinkDevice" component={LinkDeviceScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
