import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../contexts/AuthContext';
import { connectToServer, getConnectionStatus } from '../services/api';
import { MaterialIcons } from '@expo/vector-icons';

export default function LoginScreen() {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [linkCode, setLinkCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [viewMode, setViewMode] = useState('phoneInput'); // 'phoneInput' or 'qrOrLink'
  const [codeMode, setCodeMode] = useState('qr'); // 'qr' or 'link'

  const handleConnect = useCallback(async () => {
    if (!phone) {
      Alert.alert('Error', 'Please enter your phone number.');
      return;
    }
    setLoading(true);
    setError(null);
    setIsConnecting(true);
    try {
      const { data } = await connectToServer(phone);
      // The backend will start generating the QR code.
      // We don't need to wait for it here.
      // The checkStatus function will poll for it.
      const { data } = await connectToServer(phone);
      setQrCode(data.qrCode);
      setLinkCode(data.linkCode);
      setViewMode('qrOrLink');
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
    }
  }, [isConnecting, phone, login]);

  useEffect(() => {
    if (isConnecting) {
      const interval = setInterval(checkStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [isConnecting, checkStatus]);

  const renderPhoneInputView = () => (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerTitle}>Link with Phone Number</Text>
      <View style={styles.card}>
        <Text style={styles.instruction}>
          Enter your phone number to start the linking process.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Phone Number (e.g., 15551234567)"
          placeholderTextColor="#8696A0"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <TouchableOpacity style={styles.connectButton} onPress={handleConnect} disabled={loading}>
          <Text style={styles.connectButtonText}>{loading ? 'Connecting...' : 'Get Link Code'}</Text>
        </TouchableOpacity>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    </ScrollView>
  );

  const renderQrOrLinkView = () => (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerTitle}>Link with {codeMode === 'qr' ? 'QR Code' : 'Phone Number'}</Text>
      <View style={styles.card}>
        {codeMode === 'qr' ? (
          <>
            <Text style={styles.instruction}>1. Open WhatsApp on your phone</Text>
            <Text style={styles.instruction}>
              2. Tap <Text style={styles.bold}>More options</Text> >{' '}
              <Text style={styles.bold}>Linked devices</Text>
            </Text>
            <Text style={styles.instruction}>
              3. Tap <Text style={styles.bold}>LINK A DEVICE</Text>
            </Text>
            <Text style={styles.instruction}>
              4. Point your phone to this screen to capture the code
            </Text>
            <View style={styles.qrContainer}>
              {qrCode ? (
                <QRCode value={qrCode} size={250} backgroundColor="#FFF" color="#111B21" />
              ) : (
                <ActivityIndicator size="large" color="#00A884" />
              )}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.instruction}>
              Open WhatsApp on your phone, go to Linked Devices > Link with phone number, and enter this code.
            </Text>
            <Text style={styles.linkCodeText}>{linkCode || '...'}</Text>
            <Text style={styles.instruction}>Waiting for you to confirm on your phone...</Text>
          </>
        )}
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
      <TouchableOpacity style={styles.switchButton} onPress={() => setCodeMode(codeMode === 'qr' ? 'link' : 'qr')}>
        <Text style={styles.switchButtonText}>
          {codeMode === 'qr' ? 'Link with phone number instead' : 'Scan QR code instead'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderContent = () => {
    return viewMode === 'phoneInput' ? renderPhoneInputView() : renderQrOrLinkView();
  };

  return <View style={{ flex: 1, backgroundColor: '#111B21' }}>{renderContent()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#111B21',
  },
  headerTitle: {
    fontSize: 22,
    color: '#FFF',
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#202C33',
    borderRadius: 12,
    padding: 25,
    width: '100%',
    alignItems: 'center',
  },
  instruction: {
    color: '#8696A0',
    fontSize: 16,
    textAlign: 'left',
    marginBottom: 12,
    width: '100%',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#1F2C34',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    color: '#FFF',
    borderWidth: 1,
    borderColor: '#8696A0',
  },
  connectButton: {
    backgroundColor: '#00A884',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  connectButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bold: {
    fontWeight: 'bold',
  },
  qrContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 8,
    minHeight: 270,
    minWidth: 270,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkCodeText: {
    fontSize: 32,
    color: '#FFF',
    fontWeight: 'bold',
    letterSpacing: 8,
    marginVertical: 20,
  },
  errorText: {
    color: '#F15C6D',
    marginTop: 20,
    textAlign: 'center',
    fontSize: 14,
  },
  switchButton: {
    marginTop: 30,
  },
  switchButtonText: {
    color: '#00A884',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    color: '#00A884',
    marginLeft: 10,
    fontSize: 16,
  },
});
