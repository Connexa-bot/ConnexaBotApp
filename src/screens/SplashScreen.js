import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import WhatsappLogo from '../../assets/whatsapp-logo.svg';
import MetaLogo from '../../assets/meta-logo.svg';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <WhatsappLogo width={80} height={80} />
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>from</Text>
        <MetaLogo width={70} height={14} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#075e54',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingBottom: 50,
    alignItems: 'center',
  },
  footerText: {
    color: '#AEBAC1',
    fontSize: 14,
    marginBottom: 8,
  },
});