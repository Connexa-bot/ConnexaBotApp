import React, { createContext, useContext, useState } from 'react';
import { Appearance } from 'react-native';

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

// ✅ Add font definitions (used internally by React Navigation)
const fonts = {
  regular: { fontFamily: 'System', fontWeight: '400' },
  medium: { fontFamily: 'System', fontWeight: '500' },
  bold: { fontFamily: 'System', fontWeight: '700' },
  heavy: { fontFamily: 'System', fontWeight: '800' },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(Appearance.getColorScheme() === 'dark');

  const theme = {
    dark: isDarkMode,
    colors: isDarkMode ? darkColors : lightColors,
    fonts, // ✅ Add this line
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, setIsDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
