import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import { DefaultTheme, DarkTheme } from '@react-navigation/native';

const lightColors = {
  primary: '#075E54',
  background: '#FFFFFF',
  card: '#FFFFFF',
  text: '#000000',
  border: '#ECE5DD',
  notification: '#128C7E',
};

const darkColors = {
  primary: '#075E54',
  background: '#121212',
  card: '#1E1E1E',
  text: '#FFFFFF',
  border: '#272727',
  notification: '#128C7E',
};

// ✅ Define font weights React Navigation expects
const fonts = {
  regular: { fontFamily: 'System', fontWeight: '400' },
  medium: { fontFamily: 'System', fontWeight: '500' },
  bold: { fontFamily: 'System', fontWeight: '700' },
  heavy: { fontFamily: 'System', fontWeight: '800' },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(Appearance.getColorScheme() === 'dark');

  // Automatically update if system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setIsDarkMode(colorScheme === 'dark');
    });
    return () => subscription.remove();
  }, []);

  const theme = {
    dark: isDarkMode,
    colors: isDarkMode ? darkColors : lightColors,
    fonts,
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, setIsDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
