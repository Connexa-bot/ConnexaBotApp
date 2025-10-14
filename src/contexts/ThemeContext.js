import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { storage } from '../utils/storage';

const ThemeContext = createContext();

const colorSchemes = {
  light: {
    // Primary Colors
    primary: '#00A884',
    secondary: '#008069',
    
    // Backgrounds
    background: '#FFFFFF',
    secondaryBackground: '#F0F2F5',
    header: '#008069',
    chatBackground: '#EFEAE2',
    inputBackground: '#F0F2F5',
    attachmentBg: '#F0F2F5',
    
    // Text Colors
    headerText: '#FFFFFF',
    text: '#111B21',
    secondaryText: '#667781',
    tertiaryText: '#8696A0',
    
    // Borders & Dividers
    border: '#E9EDEF',
    divider: '#E9EDEF',
    inputBorder: '#E9EDEF',
    
    // Tab Bar
    tabBar: '#FFFFFF',
    tabIconSelected: '#00A884',
    tabIconDefault: '#8696A0',
    tabLabelSelected: '#00A884',
    tabLabelDefault: '#667781',
    
    // Message Bubbles
    messageBubbleSent: '#D9FDD3',
    messageBubbleReceived: '#FFFFFF',
    messageBubbleSentText: '#111B21',
    messageBubbleReceivedText: '#111B21',
    
    // Badges & Indicators
    unreadBadge: '#25D366',
    unreadBadgeText: '#FFFFFF',
    onlineIndicator: '#25D366',
    
    // Icons
    iconColor: '#667781',
    activeIconColor: '#00A884',
    
    // Other
    link: '#027EB5',
    statusBar: 'light-content',
    cardBackground: '#FFFFFF',
    shadowColor: '#000000',
  },

  dark: {
    // Primary Colors
    primary: '#00A884',
    secondary: '#008069',
    
    // Backgrounds
    background: '#111B21',
    secondaryBackground: '#1E2A30',
    header: '#202C33',
    chatBackground: '#0B141A',
    inputBackground: '#2A3942',
    attachmentBg: '#2A3942',
    
    // Text Colors
    headerText: '#E9EDEF',
    text: '#E9EDEF',
    secondaryText: '#8696A0',
    tertiaryText: '#667781',
    
    // Borders & Dividers
    border: '#2A3942',
    divider: '#2A3942',
    inputBorder: '#2A3942',
    
    // Tab Bar
    tabBar: '#1F2C34',
    tabIconSelected: '#00A884',
    tabIconDefault: '#8696A0',
    tabLabelSelected: '#00A884',
    tabLabelDefault: '#8696A0',
    
    // Message Bubbles
    messageBubbleSent: '#005C4B',
    messageBubbleReceived: '#202C33',
    messageBubbleSentText: '#E9EDEF',
    messageBubbleReceivedText: '#E9EDEF',
    
    // Badges & Indicators
    unreadBadge: '#00A884',
    unreadBadgeText: '#111B21',
    onlineIndicator: '#00A884',
    
    // Icons
    iconColor: '#8696A0',
    activeIconColor: '#00A884',
    
    // Other
    link: '#53BDEB',
    statusBar: 'light-content',
    cardBackground: '#1F2C34',
    shadowColor: '#000000',
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
      isLoading,
    }),
    [themePreference, actualTheme, isLoading]
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
