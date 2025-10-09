import React, { useEffect } from "react";
import "react-native-gesture-handler";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import { AuthProvider } from "./src/contexts/AuthContext";
import RootNavigator from "./src/navigation";
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  useEffect(() => {
    const setupNavigationBar = async () => {
      await NavigationBar.setBehaviorAsync('inset-swipe');
      await NavigationBar.setVisibilityAsync('hidden');
    };
    setupNavigationBar();
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </ThemeProvider>
    </AuthProvider>
  );
}
