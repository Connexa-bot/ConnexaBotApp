import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useThemeContext } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { connectToServer, getConnectionStatus } from '../services/api';

export default function LoginScreen() {
  const { theme } = useThemeContext();
  const { login } = useAuth();

  const [phone, setPhone] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [linkCode, setLinkCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Controls which screen is visible: phone input or QR/link view
  const [viewMode, setViewMode] = useState('phoneInput');
  // Controls whether QR or link code is shown
  const [codeMode, setCodeMode] = useState('qr');

  const handleConnect = useCallback(async () => {
    if (!phone) {
      Alert.alert('Error', 'Please enter your phone number.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await connectToServer(phone);
      if (data.qrCode) {
        setQrCode(data.qrCode);
        setLinkCode(data.linkCode);
        setViewMode('qrOrLink');
        setIsConnecting(true); // Start polling for connection status
      } else {
        setError('Could not retrieve QR code. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  }, [phone]);

  const checkStatus = useCallback(async () => {
    if (!isConnecting || !phone) return;
    try {
      const { data } = await getConnectionStatus(phone);
      if (data.connected) {
        setIsConnecting(false);
        login(phone);
      }
    } catch (err) {
      console.error('Status check failed:', err.message);
      // Don't set a generic error here, as it might overwrite a more specific one.
    }
  }, [isConnecting, phone, login]);

  useEffect(() => {
    if (isConnecting) {
      const interval = setInterval(checkStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [isConnecting, checkStatus]);

  const renderPhoneInputView = () => (
    <>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Connect Your WhatsApp
      </Text>

      <TextInput
        style={[
          styles.input,
          { color: theme.colors.text, borderColor: theme.colors.border },
        ]}
        placeholder="Phone Number (e.g., 15551234567)"
        placeholderTextColor="gray"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <Button
        title={loading ? 'Connecting...' : 'Connect'}
        onPress={handleConnect}
        disabled={loading}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}
    </>
  );

  const renderQrOrLinkView = () => (
    <>
      {loading && <ActivityIndicator size="large" color={theme.colors.primary} />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {codeMode === 'qr' && qrCode && (
        <View style={styles.qrContainer}>
          <Text style={[styles.instruction, { color: theme.colors.text }]}>
            Scan this QR code in WhatsApp → Linked Devices → Link a Device
          </Text>
          <QRCode value={qrCode} size={250} />
          <TouchableOpacity onPress={() => setCodeMode('link')}>
            <Text style={styles.switchLink}>Link with phone number instead</Text>
          </TouchableOpacity>
        </View>
      )}

      {codeMode === 'link' && linkCode && (
        <View style={styles.qrContainer}>
          <Text style={[styles.instruction, { color: theme.colors.text }]}>
            Enter this code in WhatsApp → Linked Devices → Link with phone number
          </Text>
          <Text style={styles.linkCode}>{linkCode}</Text>
          <TouchableOpacity onPress={() => setCodeMode('qr')}>
            <Text style={styles.switchLink}>Scan QR code instead</Text>
          </TouchableOpacity>
        </View>
      )}

      {codeMode === 'link' && !linkCode && !loading && (
        <Text style={[styles.instruction, { color: theme.colors.text }]}>
          Waiting for link code...
        </Text>
      )}
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {viewMode === 'phoneInput' ? renderPhoneInputView() : renderQrOrLinkView()}
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
    marginBottom: 20,
  },
  switchLink: {
    color: '#075E54',
    marginTop: 20,
    fontSize: 16,
  },
});
