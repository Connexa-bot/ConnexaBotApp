import React, { createContext, useContext, useState, useMemo } from "react";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  const theme = useMemo(() => (isDark ? DarkTheme : DefaultTheme), [isDark]);
  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ✅ Custom hook you can call anywhere
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used inside a ThemeProvider");
  }
  return context;
};
