import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useThemeContext } from '../contexts/ThemeContext';
import { setApiBaseUrl, connectToServer, getConnectionStatus } from '../services/api';

export default function LoginScreen({ navigation }) {
  const { theme } = useThemeContext();
  const [phone, setPhone] = useState('');
  const [serverUrl, setServerUrl] = useState('http://192.168.1.10:5000'); // Default for convenience
  const [qrCode, setQrCode] = useState(null);
  const [linkCode, setLinkCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (!phone || !serverUrl) {
      Alert.alert('Error', 'Please enter both your phone number and the server URL.');
      return;
    }
    setLoading(true);
    setError(null);
    setQrCode(null);
    setLinkCode(null);
    setIsConnecting(true);

    // Set the base URL for both API and WebSocket connections
    setApiBaseUrl(serverUrl);

    try {
      const { data } = await connectToServer(phone);
      if (data.qrCodeDataUrl) {
        setQrCode(data.qrCodeDataUrl);
      }
      if (data.linkCode) {
        setLinkCode(data.linkCode);
      }
      if (data.connected) {
        // Pass serverUrl along with phone
        navigation.replace('Main', { phone, serverUrl });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An unknown error occurred.';
      setError(errorMessage);
      setIsConnecting(false);
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = useCallback(async () => {
    if (!isConnecting || !phone) return;

    try {
      const { data } = await getConnectionStatus(phone);
      if (data.connected) {
        setIsConnecting(false);
        setQrCode(null);
        setLinkCode(null);
        navigation.replace('Main', { phone, serverUrl });
      } else {
        if (data.qrCodeDataUrl) {
          setQrCode(data.qrCodeDataUrl);
        }
        if (data.linkCode) {
          setLinkCode(data.linkCode);
        }
        if (data.error) {
          setError(data.error);
        }
      }
    } catch (err) {
        console.error("Status check failed:", err.message);
    }
  }, [isConnecting, navigation, phone, serverUrl]);

  useEffect(() => {
    if (isConnecting) {
      const interval = setInterval(checkStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [isConnecting, checkStatus]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Connect Your WhatsApp</Text>

      <TextInput
        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
        placeholder="Server URL (e.g., http://192.168.1.10:5000)"
        placeholderTextColor="gray"
        keyboardType="url"
        value={serverUrl}
        onChangeText={setServerUrl}
        editable={!isConnecting}
        autoCapitalize="none"
      />

      <TextInput
        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
        placeholder="Phone Number (e.g., 15551234567)"
        placeholderTextColor="gray"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        editable={!isConnecting}
      />

      <Button
        title={isConnecting ? 'Connecting...' : 'Get QR Code'}
        onPress={handleConnect}
        disabled={loading || isConnecting}
      />

      {loading && <ActivityIndicator size="large" color={theme.colors.primary} style={styles.feedback} />}

      {error && <Text style={styles.errorText}>{error}</Text>}

      {qrCode && !linkCode && (
        <View style={styles.qrContainer}>
          <Text style={[styles.instruction, { color: theme.colors.text }]}>
            {'Scan this QR code in WhatsApp > Linked Devices > Link a Device'}
          </Text>
          <QRCode value={qrCode} size={250} />
        </View>
      )}

      {linkCode && (
        <View style={styles.qrContainer}>
          <Text style={[styles.instruction, { color: theme.colors.text }]}>
            {'Alternatively, go to "Link with phone number" and enter this code:'}
          </Text>
          <Text style={styles.linkCode}>{linkCode}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  feedback: {
    marginVertical: 20,
  },
  errorText: {
    color: 'red',
    marginVertical: 10,
    textAlign: 'center',
  },
  qrContainer: {
    alignItems: 'center',
    marginTop: 30,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  instruction: {
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
  },
  linkCode: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#075E54',
    letterSpacing: 4,
  },
});