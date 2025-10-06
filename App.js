import React, { useEffect } from "react";
import "react-native-gesture-handler";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import { AuthProvider } from "./src/contexts/AuthContext";
import RootNavigator from "./src/navigation";
import * as SystemUI from 'expo-system-ui';

export default function App() {
  useEffect(() => {
    // Set the navigation bar behavior to hide by default and show on swipe
    SystemUI.setBehaviorAsync('inset-swipe');
    // Hide the navigation bar
    SystemUI.setVisibilityAsync('hidden');
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </AuthProvider>
  );
}