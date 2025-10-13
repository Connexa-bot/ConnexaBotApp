import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { storage } from '../utils/storage';

const ThemeContext = createContext();

const colorSchemes = {
  light: {
    primary: '#00A884',
    secondary: '#008069',
    background: '#FFFFFF',
    header: '#008069',
    headerText: '#FFFFFF',
    text: '#111B21',
    secondaryText: '#667781',
    tertiaryText: '#8696A0',
    border: '#E9EDEF',
    divider: '#E9EDEF',
    tabIconSelected: '#FFFFFF',
    tabIconDefault: 'rgba(255, 255, 255, 0.6)',
    chatBackground: '#EFEAE2',
    messageBubbleSent: '#D9FDD3',
    messageBubbleReceived: '#FFFFFF',
    messageBubbleSentText: '#111B21',
    messageBubbleReceivedText: '#111B21',
    inputBackground: '#F0F2F5',
    inputBorder: '#E9EDEF',
    unreadBadge: '#25D366',
    unreadBadgeText: '#FFFFFF',
    iconColor: '#667781',
    activeIconColor: '#00A884',
    onlineIndicator: '#25D366',
    link: '#027EB5',
    attachmentBg: '#F0F2F5',
  },

  dark: {
    primary: '#00A884',
    secondary: '#008069',
    background: '#111B21',
    header: '#202C33',
    headerText: '#E9EDEF',
    text: '#E9EDEF',
    secondaryText: '#8696A0',
    tertiaryText: '#667781',
    border: '#2A3942',
    divider: '#2A3942',
    tabIconSelected: '#00A884',
    tabIconDefault: 'rgba(255, 255, 255, 0.6)',
    chatBackground: '#0B141A',
    messageBubbleSent: '#005C4B',
    messageBubbleReceived: '#202C33',
    messageBubbleSentText: '#E9EDEF',
    messageBubbleReceivedText: '#E9EDEF',
    inputBackground: '#2A3942',
    inputBorder: '#2A3942',
    unreadBadge: '#00A884',
    unreadBadgeText: '#111B21',
    iconColor: '#8696A0',
    activeIconColor: '#00A884',
    onlineIndicator: '#00A884',
    link: '#53BDEB',
    attachmentBg: '#2A3942',
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