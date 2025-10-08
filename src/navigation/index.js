import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useThemeContext } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { SocketProvider } from '../contexts/SocketContext';

// Screens
import SplashScreen from '../screens/SplashScreen';
import AppNavigator from './AppNavigator';

export default function RootNavigator() {
  const { theme } = useThemeContext();
  const { user, isLoading } = useAuth();
  const [isSplashFinished, setIsSplashFinished] = React.useState(false);

  // Keep showing splash screen until it finishes its animation AND auth state is loaded
  if (!isSplashFinished || isLoading) {
    return <SplashScreen onFinish={() => setIsSplashFinished(true)} />;
  }

  return (
    <NavigationContainer theme={theme}>
      {user?.phone ? (
        <SocketProvider phone={user.phone}>
          <AppNavigator />
        </SocketProvider>
      ) : (
        <AppNavigator />
      )}
    </NavigationContainer>
  );
}