import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { storage } from '../utils/storage';

const ThemeContext = createContext();

const colorSchemes = {
  light: {
    primary: '#008069',
    primaryLight: '#25D366',
    background: '#FFFFFF',
    secondaryBackground: '#F0F2F5',
    chatBackground: '#EFEAE2',
    text: '#000000',
    secondaryText: '#667781',
    border: '#E9EDEF',
    messageSent: '#D9FDD3',
    messageReceived: '#FFFFFF',
    icon: '#54656F',
    tabBar: '#F0F2F5',
    header: '#008069',
    headerText: '#FFFFFF',
    tabIconDefault: 'rgba(255, 255, 255, 0.6)',
    tabIconSelected: '#FFFFFF',
    unreadBadge: '#25D366',
    divider: 'rgba(0, 0, 0, 0.05)',
  },
  dark: {
    primary: '#00a884',
    primaryLight: '#25D366',
    background: '#0B141A',
    secondaryBackground: '#1F2C34',
    chatBackground: '#0B141A',
    text: '#E9EDEF',
    secondaryText: '#8696A0',
    border: '#222D34',
    messageSent: '#005C4B',
    messageReceived: '#1F2C34',
    icon: '#8696A0',
    tabBar: '#1F2C34',
    header: '#1F2C34',
    headerText: '#E9EDEF',
    tabIconDefault: 'rgba(255, 255, 255, 0.6)',
    tabIconSelected: '#00a884',
    unreadBadge: '#00a884',
    divider: 'rgba(255, 255, 255, 0.05)',
  },
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePreference] = useState('system');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedPreference = await storage.getItem('themePreference');
      if (savedPreference) {
        setThemePreference(savedPreference);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveThemePreference = async (preference) => {
    try {
      await storage.setItem('themePreference', preference);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const setTheme = async (preference) => {
    setThemePreference(preference);
    await saveThemePreference(preference);
  };

  const actualTheme = themePreference === 'system' 
    ? (systemColorScheme || 'light')
    : themePreference;

  const value = useMemo(
    () => ({
      themePreference,
      actualTheme,
      colors: colorSchemes[actualTheme],
      setTheme,
      isDark: actualTheme === 'dark',
    }),
    [themePreference, actualTheme]
  );

  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
