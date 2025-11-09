import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function AppSplashScreen({ onComplete }) {
  const { colors, isDark } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate logo entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Start loading spinner
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();

    // Auto complete after minimum time (simulating WhatsApp behavior)
    const timer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Logo Container */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View
          style={[
            styles.logoCircle,
            { backgroundColor: colors.primary },
          ]}
        >
          <Ionicons name="chatbubbles" size={80} color="#FFFFFF" />
        </View>
      </Animated.View>

      {/* App Name */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={[styles.appName, { color: colors.text }]}>
          Connexa
        </Text>
      </Animated.View>

      {/* Loading Spinner */}
      <Animated.View
        style={[
          styles.loadingContainer,
          { transform: [{ rotate: spin }] },
        ]}
      >
        <Ionicons
          name="sync-outline"
          size={32}
          color={colors.primary}
        />
      </Animated.View>

      {/* Footer Text */}
      <View style={styles.footer}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={[styles.footerText, { color: colors.secondaryText }]}>
            from
          </Text>
          <Text style={[styles.companyName, { color: colors.text }]}>
            CONNEXA
          </Text>
        </Animated.View>
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
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 40,
  },
  loadingContainer: {
    marginTop: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 2,
    textAlign: 'center',
  },
});
