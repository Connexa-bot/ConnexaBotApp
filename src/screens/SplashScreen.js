import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import WhatsappLogo from '../../assets/whatsapp-logo.svg';

export default function SplashScreen({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      }
    }, 2500); // Show splash for 2.5 seconds

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <WhatsappLogo width={80} height={80} />
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>from</Text>
        <Text style={[styles.footerText, { fontWeight: 'bold' }]}>Connexabot</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#075e54',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -20 }], // Move logo up slightly
  },
  footer: {
    position: 'absolute', // Position at the bottom
    bottom: 50, // Space from the bottom edge
    alignItems: 'center',
  },
  footerText: {
    color: '#AEBAC1',
    fontSize: 16,
  },
});