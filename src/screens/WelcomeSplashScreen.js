import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function WelcomeSplashScreen({ onComplete }) {
  const { colors } = useTheme();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log('🟢 [SPLASH] Starting fade animation');
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: false,
    }).start();

    console.log('🟢 [SPLASH] Setting timeout for 2.5s');
    const timer = setTimeout(() => {
      console.log('🟢 [SPLASH] Timeout fired, calling onComplete');
      if (onComplete) {
        onComplete();
      } else {
        console.error('🔴 [SPLASH] onComplete is not defined!');
      }
    }, 2500);

    return () => {
      console.log('🟢 [SPLASH] Cleanup - clearing timeout');
      clearTimeout(timer);
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Ionicons 
          name="logo-whatsapp" 
          size={120} 
          color="#25D366" 
          style={styles.logo}
        />
      </Animated.View>
      
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.secondaryText }]}>
          from
        </Text>
        <Text style={[styles.brandText, { color: colors.text }]}>
          Connexa
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
  },
  footer: {
    paddingBottom: 50,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    marginBottom: 4,
  },
  brandText: {
    fontSize: 20,
    fontWeight: '600',
  },
});
