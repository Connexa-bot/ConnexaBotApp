import { useEffect } from "react";
import * as NavigationBar from "expo-navigation-bar";
import { useIsFocused } from "@react-navigation/native";
import { Platform } from "react-native";

export default function useNavigationBar() {
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused && Platform.OS === 'android') {
      const configureBar = async () => {
        await NavigationBar.setVisibilityAsync("hidden");
        await NavigationBar.setBehaviorAsync("inset-swipe");
        await NavigationBar.setBackgroundColorAsync("transparent");
      };
      configureBar();
    }
  }, [isFocused]);
}