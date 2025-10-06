import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useThemeContext } from '../contexts/ThemeContext';
import { SocketProvider } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';

import SplashScreen from '../screens/SplashScreen';
import AppNavigator from './AppNavigator';

export default function RootNavigator() {
  const { theme } = useThemeContext();
  const { user } = useAuth();
  const [isSplashFinished, setIsSplashFinished] = React.useState(false);

  if (!isSplashFinished) {
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