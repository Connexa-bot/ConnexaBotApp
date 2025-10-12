import React, { useEffect, useState, useCallback } from "react";
import "react-native-gesture-handler";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import { AuthProvider } from "./src/contexts/AuthContext";
import { WallpaperProvider } from "./src/contexts/WallpaperContext";
import { AIProvider } from "./src/contexts/AIContext";
import RootNavigator from "./src/navigation";
import * as NavigationBar from 'expo-navigation-bar';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        const setupNavigationBar = async () => {
          await NavigationBar.setBehaviorAsync('inset-swipe');
          await NavigationBar.setVisibilityAsync('hidden');
        };
        await setupNavigationBar();
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <WallpaperProvider>
          <AIProvider>
            <StatusBar style="light" />
            <RootNavigator onReady={onLayoutRootView} />
          </AIProvider>
        </WallpaperProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
