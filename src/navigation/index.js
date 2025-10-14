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
  const { user, loading } = useAuth();
  const { colors, isDark } = useTheme();
  
  // Welcome flow states
  const [showWelcome, setShowWelcome] = useState(true);
  const [showTerms, setShowTerms] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  
  // App loading state (for returning users)
  const [showAppSplash, setShowAppSplash] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    // Show splash screen for returning users
    if (hasSeenWelcome && user && !loading) {
      setShowAppSplash(true);
    }
  }, [hasSeenWelcome, user, loading]);

  const initializeApp = async () => {
    try {
      const seen = await storage.getItem('hasSeenWelcome');
      if (seen === 'true') {
        console.log('🔵 [NAV] User has seen welcome, checking auth...');
        setShowWelcome(false);
        setHasSeenWelcome(true);
      } else {
        console.log('🔵 [NAV] First time user, showing welcome');
      }
    } catch (error) {
      console.error('Error checking welcome status:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleWelcomeComplete = () => {
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

  const handleAppSplashComplete = () => {
    console.log('🔵 [NAV] App splash complete');
    setShowAppSplash(false);
  };

  // Initial loading (checking storage)
  if (isInitializing) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: colors.background 
      }}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </View>
    );
  }

  // First time welcome screen
  if (showWelcome) {
    console.log('🔵 [NAV] Rendering WelcomeSplashScreen');
    return (
      <>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <WelcomeSplashScreen onComplete={handleWelcomeComplete} />
      </>
    );
  }

  // Terms and privacy screen
  if (showTerms) {
    console.log('🔵 [NAV] Rendering TermsPrivacyScreen');
    return (
      <>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <TermsPrivacyScreen onContinue={handleTermsAccept} />
      </>
    );
  }

  // App splash for returning users (shows while verifying connection)
  if (showAppSplash && loading) {
    console.log('🔵 [NAV] Rendering AppSplashScreen (verifying connection)');
    return (
      <>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <AppSplashScreen onComplete={handleAppSplashComplete} />
      </>
    );
  }

  // Main app navigation
  console.log('🔵 [NAV] Rendering main navigation, user:', user ? 'logged in' : 'not logged in');
  
  return (
    <>
      <StatusBar 
        style={isDark ? 'light' : 'dark'} 
        backgroundColor={colors.header} 
      />
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
