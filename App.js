import React from "react";
import "react-native-gesture-handler";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import { AuthProvider } from "./src/contexts/AuthContext";
import RootNavigator from "./src/navigation";

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </AuthProvider>
  );
}