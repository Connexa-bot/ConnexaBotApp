import React, { useEffect, useState } from "react";
import "react-native-gesture-handler";
import { Platform, View, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from "./src/contexts/ThemeContext";
import { AuthProvider } from "./src/contexts/AuthContext";
import { WallpaperProvider } from "./src/contexts/WallpaperContext";
import { AIProvider } from "./src/contexts/AIContext";
import RootNavigator from "./src/navigation";
import * as SplashScreen from 'expo-splash-screen';

if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync();
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(Platform.OS === 'web');

  useEffect(() => {
    async function prepare() {
      try {
        // Kept for splash screen timing
        if (Platform.OS !== 'web') {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    if (Platform.OS !== 'web') {
      prepare();
    }
  }, []);

  useEffect(() => {
    if (appIsReady && Platform.OS !== 'web') {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#008069" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <WallpaperProvider>
            <AIProvider>
              <RootNavigator />
            </AIProvider>
          </WallpaperProvider>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
