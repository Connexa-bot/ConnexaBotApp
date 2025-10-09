import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useThemeContext } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { connectToServer, getConnectionStatus } from '../services/api';
import WhatsappLogo from '../../assets/whatsapp-logo.svg';

export default function LoginScreen() {
  const { theme } = useThemeContext();
  const { login, clearPreviousSession } = useAuth();

  const [phone, setPhone] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [linkCode, setLinkCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // State to manage the 3-step flow: 'initial', 'numberInput', 'qrOrLink'
  const [currentView, setCurrentView] = useState('initial');
  const [codeMode, setCodeMode] = useState('qr');

  const handleConnect = useCallback(async () => {
    if (!phone) {
      Alert.alert('Error', 'Please enter your phone number.');
      return;
    }

    // Basic phone validation
    if (!/^\d+$/.test(phone)) {
      Alert.alert('Error', 'Phone number should only contain digits (no spaces or special characters).');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Clear any old session before attempting a new one
      await clearPreviousSession();
      
      console.log('Connecting with phone:', phone);
      const { data } = await connectToServer(phone);
      
      console.log('Connect response:', data);

      if (data.connected) {
        await login(phone);
        return;
      }

      if (data.qrCode || data.linkCode) {
        setQrCode(data.qrCode);
        setLinkCode(data.linkCode);
        setCurrentView('qrOrLink');
        setIsConnecting(true);
      } else {
        setError(data.message || 'Could not retrieve authentication code. Please try again.');
      }
    } catch (err) {
      console.error('Connection error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url,
      });

      let errorMessage = 'An error occurred during connection.';
      
      if (err.response) {
        // Server responded with error
        if (err.response.status === 404) {
          errorMessage = 'Backend server endpoint not found. Please check if the server is running.';
        } else {
          errorMessage = err.response.data?.error || err.response.data?.message || errorMessage;
        }
      } else if (err.request) {
        // Request made but no response
        errorMessage = 'Cannot reach the server. Please check your connection and server status.';
      }
      
      setError(errorMessage);
      Alert.alert('Connection Error', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [phone, login, clearPreviousSession]);

  const checkStatus = useCallback(async () => {
    if (!isConnecting || !phone) return;
    
    try {
      const { data } = await getConnectionStatus(phone);
      console.log('Status check:', data);
      
      if (data.connected) {
        setIsConnecting(false);
        await login(phone);
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

  useEffect(() => {
    const backAction = () => {
      if (currentView === 'qrOrLink') {
        setCurrentView('numberInput');
        setIsConnecting(false);
        setQrCode(null);
        setLinkCode(null);
        return true;
      }
      if (currentView === 'numberInput') {
        setCurrentView('initial');
        setPhone('');
        setError(null);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [currentView]);

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
        editable={!loading}
      />
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.halfButton, { marginRight: 10 }, loading && styles.buttonDisabled]}
          onPress={() => {
            setCodeMode('qr');
            handleConnect();
          }}
          disabled={loading}
        >
          {loading && codeMode === 'qr' ? (
            <ActivityIndicator size="small" color="#111B21" />
          ) : (
            <Text style={styles.connectButtonText}>Get QR</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.halfButton, loading && styles.buttonDisabled]}
          onPress={() => {
            setCodeMode('link');
            handleConnect();
          }}
          disabled={loading}
        >
          {loading && codeMode === 'link' ? (
            <ActivityIndicator size="small" color="#111B21" />
          ) : (
            <Text style={styles.connectButtonText}>Get Code</Text>
          )}
        </TouchableOpacity>
      </View>
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

      {!loading && codeMode === 'qr' && qrCode && (
        <>
          <View style={styles.instructionList}>
            <Text style={[styles.instructionText, { color: theme.colors.text }]}>
              1. Open WhatsApp on your phone
            </Text>
            <Text style={[styles.instructionText, { color: theme.colors.text }]}>
              2. Tap <Text style={{fontWeight: 'bold'}}>Menu</Text> or <Text style={{fontWeight: 'bold'}}>Settings</Text> and select <Text style={{fontWeight: 'bold'}}>Linked Devices</Text>
            </Text>
            <Text style={[styles.instructionText, { color: theme.colors.text }]}>
              3. Tap on <Text style={{fontWeight: 'bold'}}>Link a device</Text>
            </Text>
            <Text style={[styles.instructionText, { color: theme.colors.text }]}>
              4. Point your phone to this screen to capture the code
            </Text>
          </View>
          <View style={styles.qrContainer}>
            <View style={styles.qrCodeWrapper}>
              <QRCode value={qrCode} size={230} />
            </View>
          </View>
          <TouchableOpacity 
            style={{ marginTop: 20 }} 
            onPress={() => {
              setCodeMode('link');
            }}
          >
            <Text style={styles.switchLink}>Use Link Code instead</Text>
          </TouchableOpacity>
        </>
      )}

      {!loading && codeMode === 'link' && (
        <View style={{alignItems: 'center', width: '100%'}}>
          <Text style={[styles.instruction, { color: theme.colors.text, marginBottom: 20 }]}>
            Enter this code on your primary phone
          </Text>
          {linkCode ? (
            <Text style={styles.linkCode}>{linkCode}</Text>
          ) : (
            <Text style={styles.linkCode}>---</Text>
          )}
          <View style={styles.instructionList}>
            <Text style={[styles.instructionText, { color: theme.colors.text }]}>
              1. Open WhatsApp on your phone
            </Text>
            <Text style={[styles.instructionText, { color: theme.colors.text }]}>
              2. Tap <Text style={{fontWeight: 'bold'}}>Menu</Text> or <Text style={{fontWeight: 'bold'}}>Settings</Text> and select <Text style={{fontWeight: 'bold'}}>Linked Devices</Text>
            </Text>
            <Text style={[styles.instructionText, { color: theme.colors.text }]}>
              3. Tap on <Text style={{fontWeight: 'bold'}}>Link a device</Text>
            </Text>
            <Text style={[styles.instructionText, { color: theme.colors.text }]}>
              4. Select <Text style={{fontWeight: 'bold'}}>Link with phone number instead</Text>
            </Text>
            <Text style={[styles.instructionText, { color: theme.colors.text }]}>
              5. Enter the code shown above
            </Text>
          </View>
          <TouchableOpacity 
            style={{ marginTop: 20 }} 
            onPress={() => {
              setCodeMode('qr');
            }}
          >
            <Text style={styles.switchLink}>Scan QR Code instead</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity 
        style={{ marginTop: 20 }}
        onPress={() => {
          setCurrentView('numberInput');
          setIsConnecting(false);
          setQrCode(null);
          setLinkCode(null);
        }}
      >
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: -50 }],
  },
  connectButton: {
    backgroundColor: '#00A884',
    paddingVertical: 12,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
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
    marginTop: 20,
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
    backgroundColor: '#1F2C34',
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
    color: '#E9EDEF',
  },
  linkCode: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#25D366',
    letterSpacing: 4,
    marginBottom: 20,
    backgroundColor: '#E9EDEF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    overflow: 'hidden',
  },
  switchLink: {
    color: '#25D366',
    marginTop: 20,
    fontSize: 16,
  },
});
