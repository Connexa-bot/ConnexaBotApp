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

  if (!isSplashFinished || isLoading) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
            { !isSplashFinished ? <SplashScreen onFinish={() => setIsSplashFinished(true)} /> : <ActivityIndicator size="large" color={theme.colors.primary} />}
        </View>
    )
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