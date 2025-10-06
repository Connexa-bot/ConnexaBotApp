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

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(Appearance.getColorScheme() === 'dark');

  const theme = {
    dark: isDarkMode,
    colors: isDarkMode ? darkColors : lightColors,
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, setIsDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);