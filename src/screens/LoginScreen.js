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
import { useThemeContext } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { connectToServer, getConnectionStatus } from '../services/api';
import { MaterialIcons } from '@expo/vector-icons';

export default function LoginScreen() {
  const { theme } = useThemeContext();
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
    setError(null);
    setQrCode(null);
    setLinkCode(null);
    setIsConnecting(true);
    setLoading(true);

    try {
      const { data } = await connectToServer(phone);
      if (data.qrCode) setQrCode(data.qrCode);
      if (data.linkCode) setLinkCode(data.linkCode);
      if (data.connected) {
        login(phone);
      } else {
        setViewMode('qrOrLink');
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.message || 'An unknown error occurred.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [phone, login]);

  const checkStatus = useCallback(async () => {
    if (!isConnecting || !phone) return;

    try {
      const { data } = await getConnectionStatus(phone);
      if (data.connected) {
        setIsConnecting(false);
        setQrCode(null);
        setLinkCode(null);
        login(phone);
      } else {
        if (data.qrCode && !qrCode) setQrCode(data.qrCode);
        if (data.linkCode && !linkCode) setLinkCode(data.linkCode);
        if (data.error) setError(data.error);
      }
    } catch (err) {
      console.error('Status check failed:', err.message);
    }
  }, [isConnecting, phone, login, qrCode, linkCode]);

  useEffect(() => {
    if (isConnecting && viewMode === 'qrOrLink') {
      const interval = setInterval(checkStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [isConnecting, viewMode, checkStatus]);

  const renderPhoneInputView = () => (
    <View style={styles.phoneContainer}>
        <Text style={styles.headerTitle}>Enter Your Phone Number</Text>
        <Text style={styles.instruction}>
            ConnexaBot needs your phone number to connect to your WhatsApp account.
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
            <Text style={styles.connectButtonText}>{loading ? 'Connecting...' : 'Connect'}</Text>
        </TouchableOpacity>
        {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  const renderQrView = () => (
    <View style={styles.qrContainer}>
      {loading && !qrCode ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : qrCode ? (
        <QRCode value={qrCode} size={250} backgroundColor="#FFF" color="#111B21" />
      ) : (
        <Text style={[styles.instruction, { color: theme.colors.text }]}>
          Waiting for QR code...
        </Text>
      )}
    </View>
  );

  const renderLinkCodeView = () => (
    <View style={styles.linkCodeContainer}>
      {loading && !linkCode ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : linkCode ? (
        <>
          <Text style={[styles.instruction, { color: theme.colors.text, textAlign: 'center' }]}>
            Enter this code on your phone
          </Text>
          <Text style={styles.linkCodeText}>{linkCode}</Text>
        </>
      ) : (
        <Text style={[styles.instruction, { color: theme.colors.text, textAlign: 'center' }]}>
          Waiting for link code...
        </Text>
      )}
    </View>
  );

  const renderQrOrLinkView = () => (
     <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerTitle}>Link with QR Code</Text>
      <View style={styles.card}>
        <Text style={styles.instruction}>
          1. Open WhatsApp on your phone
        </Text>
        <Text style={styles.instruction}>
          2. Tap <Text style={styles.bold}>More options</Text> > <Text style={styles.bold}>Linked devices</Text>
        </Text>
        <Text style={styles.instruction}>
          3. Tap <Text style={styles.bold}>LINK A DEVICE</Text>
        </Text>
        <Text style={styles.instruction}>
          4. Point your phone to this screen to capture the code
        </Text>

        {codeMode === 'qr' ? renderQrView() : renderLinkCodeView()}

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      <TouchableOpacity
        style={styles.switchButton}
        onPress={() => setCodeMode(codeMode === 'qr' ? 'link' : 'qr')}
      >
        <Text style={styles.switchButtonText}>
          {codeMode === 'qr' ? 'Link with phone number instead' : 'Scan QR code instead'}
        </Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <MaterialIcons name="help-outline" size={24} color="#00A884" />
        <Text style={styles.footerText}>Need help to get started?</Text>
      </View>
    </ScrollView>
  );

  return (
      <View style={{flex: 1, backgroundColor: '#111B21'}}>
          {viewMode === 'phoneInput' ? renderPhoneInputView() : renderQrOrLinkView()}
      </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  phoneContainer: {
    flex: 1,
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
      backgroundColor: '#202C33',
      borderRadius: 8,
      paddingHorizontal: 15,
      marginBottom: 20,
      fontSize: 16,
      color: '#FFF',
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
  },
  linkCodeContainer: {
    marginTop: 20,
    padding: 20,
    alignItems: 'center',
  },
  linkCodeText: {
    fontSize: 32,
    color: '#FFF',
    fontWeight: 'bold',
    letterSpacing: 8,
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
