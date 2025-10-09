import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import WhatsappLogo from '../../assets/whatsapp-logo.svg';

export default function WelcomeScreen() {
  const navigation = useNavigation();

  const handleAgreeAndContinue = () => {
    navigation.navigate('Login');
  };

  const handlePolicyPress = () => {
    navigation.navigate('PrivacyPolicy');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <WhatsappLogo width={200} height={200} style={styles.image} />
        <Text style={styles.title}>Welcome to Connexabot</Text>
        <Text style={styles.subtitle}>
          Read our{' '}
          <Text style={styles.link} onPress={handlePolicyPress}>
            Privacy Policy
          </Text>
          . Tap &quot;Agree and continue&quot; to accept the{' '}
          <Text style={styles.link} onPress={handlePolicyPress}>
            Terms of Service
          </Text>
          .
        </Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleAgreeAndContinue}>
        <Text style={styles.buttonText}>Agree and continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111B21',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    transform: [{ translateY: -40 }], // Move content up
  },
  image: {
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E9EDEF',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 13,
    color: '#8696A0',
    textAlign: 'center',
  },
  link: {
    color: '#53BDEB',
  },
  button: {
    backgroundColor: '#00A884',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20, // Space from bottom
  },
  buttonText: {
    color: '#111B21',
    fontSize: 14,
    fontWeight: 'bold',
  },
});