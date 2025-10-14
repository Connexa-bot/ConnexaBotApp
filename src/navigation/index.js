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

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, loading } = useAuth();
  const { colors } = useTheme();
  const [showWelcomeSplash, setShowWelcomeSplash] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [appSplashComplete, setAppSplashComplete] = useState(false);

  useEffect(() => {
    if (!loading && !initialCheckDone) {
      setInitialCheckDone(true);
      if (!user) {
        setShowWelcomeSplash(true);
      }
    }
  }, [loading, user, initialCheckDone]);

  if (loading || !initialCheckDone || !appSplashComplete) {
    return <AppSplashScreen onComplete={() => setAppSplashComplete(true)} />;
  }

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
