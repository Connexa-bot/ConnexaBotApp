import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import WhatsappLogo from '../../assets/whatsapp-logo.svg'; // Import the SVG as a component

export default function WelcomeScreen() {
  const navigation = useNavigation();

  const handleAgreeAndContinue = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      {/* Use the imported SVG component */}
      <WhatsappLogo width={280} height={280} style={styles.image} />
      <Text style={styles.title}>Welcome to WhatsApp</Text>
      <Text style={styles.subtitle}>
        Read our <Text style={styles.link}>Privacy Policy</Text>. Tap "Agree and continue" to
        accept the <Text style={styles.link}>Terms of Service</Text>.
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleAgreeAndContinue}>
        <Text style={styles.buttonText}>Agree and continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111B21',
    paddingHorizontal: 50,
  },
  image: {
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E9EDEF',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#8696A0',
    textAlign: 'center',
    marginBottom: 30,
  },
  link: {
    color: '#53BDEB',
  },
  button: {
    backgroundColor: '#00A884',
    paddingVertical: 12,
    paddingHorizontal: 100,
    borderRadius: 25,
  },
  buttonText: {
    color: '#111B21',
    fontSize: 16,
    fontWeight: 'bold',
  },
});