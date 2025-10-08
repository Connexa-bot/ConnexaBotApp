import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useThemeContext } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { connectToServer, getConnectionStatus } from '../services/api';
import WhatsappLogo from '../../assets/whatsapp-logo.svg'; // Import the logo

export default function LoginScreen() {
  const { theme } = useThemeContext();
  const { login } = useAuth();

  const [phone, setPhone] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [linkCode, setLinkCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // New state to manage the 3-step flow: 'initial', 'numberInput', 'qrOrLink'
  const [currentView, setCurrentView] = useState('initial');
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
      if (data.connected) {
        await login(phone); // Await the login to ensure session is saved
        return;
      }

      if (data.qrCode || data.linkCode) {
        setQrCode(data.qrCode);
        setLinkCode(data.linkCode);
        setCurrentView('qrOrLink'); // Corrected from setViewMode to setCurrentView
        setIsConnecting(true);
      } else {
        setError(data.message || 'Could not retrieve QR code. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred during connection.');
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
        await login(phone); // Await the login to ensure session is saved
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

  const renderInitialView = () => (
    <View style={styles.initialView}>
      <View style={styles.logoContainer}>
        <WhatsappLogo width={150} height={150} />
      </View>
      <TouchableOpacity
        style={styles.connectButton}
        onPress={() => setCurrentView('numberInput')}
      >
        <Text style={styles.connectButtonText}>Connect Account</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPhoneInputView = () => (
    <View style={styles.phoneInputView}>
      <Text style={[styles.title, { color: theme.colors.text, fontSize: 20, marginBottom: 10 }]}>
        Enter your phone number
      </Text>
      <Text style={[styles.instructionText, { color: theme.colors.text, textAlign: 'center', marginBottom: 20 }]}>
        You'll need to confirm this number on your primary phone.
      </Text>
      <TextInput
        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
        placeholder="Phone Number (e.g., 15551234567)"
        placeholderTextColor="gray"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.halfButton, { marginRight: 10 }]}
          onPress={() => {
            setCodeMode('qr');
            handleConnect();
          }}
          disabled={loading}
        >
          <Text style={styles.connectButtonText}>Get QR</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.halfButton}
          onPress={() => {
            setCodeMode('link');
            handleConnect();
          }}
          disabled={loading}
        >
          <Text style={styles.connectButtonText}>Get Code</Text>
        </TouchableOpacity>
      </View>
      {loading && <ActivityIndicator style={{ marginTop: 20 }} size="large" color={theme.colors.primary} />}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  const renderQrOrLinkView = () => (
    <View style={styles.qrViewContainer}>
      <Text style={[styles.title, { color: theme.colors.text, marginBottom: 24 }]}>
        Link with a device
      </Text>

      {loading && <ActivityIndicator size="large" color={theme.colors.primary} />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {codeMode === 'qr' && qrCode && (
        <>
          <View style={styles.instructionList}>
            <Text style={[styles.instructionText, { color: theme.colors.text }]}>1. Open WhatsApp on your phone</Text>
            <Text style={[styles.instructionText, { color: theme.colors.text }]}>2. Tap <Text style={{fontWeight: 'bold'}}>Menu</Text> or <Text style={{fontWeight: 'bold'}}>Settings</Text> and select <Text style={{fontWeight: 'bold'}}>Linked Devices</Text></Text>
            <Text style={[styles.instructionText, { color: theme.colors.text }]}>3. Tap on <Text style={{fontWeight: 'bold'}}>Link a device</Text></Text>
            <Text style={[styles.instructionText, { color: theme.colors.text }]}>4. Point your phone to this screen to capture the code</Text>
          </View>
          <View style={styles.qrContainer}>
            <View style={styles.qrCodeWrapper}>
              <QRCode value={qrCode} size={230} />
            </View>
          </View>
        </>
      )}

      {codeMode === 'link' && linkCode && (
        <View style={{alignItems: 'center'}}>
          <Text style={[styles.instruction, { color: theme.colors.text, marginBottom: 20 }]}>
            Enter this code on your primary phone
          </Text>
          <Text style={styles.linkCode}>{linkCode}</Text>
        </View>
      )}

      <TouchableOpacity onPress={() => setCurrentView('numberInput')}>
        <Text style={styles.switchLink}>Wrong number?</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'numberInput':
        return renderPhoneInputView();
      case 'qrOrLink':
        return renderQrOrLinkView();
      case 'initial':
      default:
        return renderInitialView();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  initialView: {
    flex: 1,
    justifyContent: 'space-between', // Pushes logo to top, button to bottom
    alignItems: 'center',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: -50 }], // Move logo up
  },
  connectButton: {
    backgroundColor: '#00A884',
    paddingVertical: 12,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  connectButtonText: {
    color: '#111B21',
    fontSize: 14,
    fontWeight: 'bold',
  },
  qrViewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
  phoneInputView: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  halfButton: {
    backgroundColor: '#00A884',
    paddingVertical: 12,
    borderRadius: 25,
    flex: 1,
    alignItems: 'center',
  },
  instructionList: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 16,
    marginBottom: 10,
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
  errorText: {
    color: 'red',
    marginVertical: 10,
    textAlign: 'center',
  },
  qrContainer: {
    alignItems: 'center',
    marginTop: 30,
    padding: 20,
    backgroundColor: '#1F2C34', // Dark background to match header
    borderRadius: 10,
  },
  qrCodeWrapper: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
  },
  instruction: {
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
    color: '#E9EDEF', // Light text for dark container
  },
  linkCode: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#25D366', // WhatsApp green
    letterSpacing: 4,
    marginBottom: 20,
    backgroundColor: '#E9EDEF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    overflow: 'hidden', // Ensures background respects border radius
  },
  switchLink: {
    color: '#25D366', // WhatsApp green
    marginTop: 20,
    fontSize: 16,
  },
});
