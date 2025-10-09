import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Clipboard,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getConnectionStatus } from '../services/api';
import { storage } from '../utils/storage';

export default function LinkDeviceScreen() {
  const [phone, setPhone] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [linkMethod, setLinkMethod] = useState('qr'); // 'qr' or 'code'
  const [pairingCode, setPairingCode] = useState('');
  const { login, qrCode, connectionStatus, updateConnectionStatus, setUser } = useAuth();
  const { colors } = useTheme();

  useEffect(() => {
    let statusInterval;

    if (connectionStatus === 'qr_ready' && phone) {
      // Generate a pairing code (8 digits for demo)
      const code = Math.random().toString().slice(2, 10);
      setPairingCode(code);

      statusInterval = setInterval(async () => {
        try {
          const response = await getConnectionStatus(phone);
          if (response.data.status === 'connected') {
            await storage.setItem('userPhone', phone);
            updateConnectionStatus('connected');
            setUser({ phone });
            clearInterval(statusInterval);
          }
        } catch (error) {
          console.error('Status check error:', error);
        }
      }, 3000);
    }

    return () => {
      if (statusInterval) clearInterval(statusInterval);
    };
  }, [connectionStatus, phone]);

  const handleConnect = async () => {
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setIsConnecting(true);
    const result = await login(cleanPhone);
    setIsConnecting(false);

    if (!result.success) {
      Alert.alert('Connection Error', result.error || 'Failed to connect to server');
    }
  };

  const handleCopyCode = () => {
    Clipboard.setString(pairingCode);
    Alert.alert('Copied', 'Link code copied to clipboard');
  };

  const handleBack = () => {
    updateConnectionStatus('disconnected');
    setPhone('');
    setPairingCode('');
  };

  if (!qrCode) {
    // Phone input screen
    return (
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <Ionicons name="phone-portrait-outline" size={80} color={colors.primary} />
          
          <Text style={[styles.title, { color: colors.text }]}>
            Link your device
          </Text>
          
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            Enter your phone number to link your WhatsApp account
          </Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.secondaryBackground,
                color: colors.text,
                borderColor: colors.border,
              }]}
              placeholder="Phone Number (e.g., 2349154347487)"
              placeholderTextColor={colors.secondaryText}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              editable={!isConnecting}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, { 
              backgroundColor: colors.primary,
              opacity: isConnecting ? 0.6 : 1,
            }]}
            onPress={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Link Device</Text>
            )}
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.secondaryText }]}>
              You'll receive a notification from the backend when ready
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // QR Code and Link Code screen
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Link a device</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            linkMethod === 'qr' && { borderBottomColor: colors.primary, borderBottomWidth: 3 }
          ]}
          onPress={() => setLinkMethod('qr')}
        >
          <Text style={[
            styles.tabText,
            { color: linkMethod === 'qr' ? colors.text : colors.secondaryText }
          ]}>
            QR Code
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            linkMethod === 'code' && { borderBottomColor: colors.primary, borderBottomWidth: 3 }
          ]}
          onPress={() => setLinkMethod('code')}
        >
          <Text style={[
            styles.tabText,
            { color: linkMethod === 'code' ? colors.text : colors.secondaryText }
          ]}>
            Link with Code
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.methodContent}>
        {linkMethod === 'qr' ? (
          <>
            <View style={[styles.qrContainer, { backgroundColor: colors.secondaryBackground }]}>
              <QRCode
                value={qrCode}
                size={250}
                backgroundColor={colors.secondaryBackground}
                color={colors.text}
              />
            </View>
            
            <Text style={[styles.instruction, { color: colors.text }]}>
              Scan this code with WhatsApp
            </Text>
            
            <View style={styles.stepsContainer}>
              <View style={styles.step}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.secondaryText }]}>
                  Open WhatsApp on your phone
                </Text>
              </View>

              <View style={styles.step}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.secondaryText }]}>
                  Tap Menu or Settings and select Linked Devices
                </Text>
              </View>

              <View style={styles.step}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.secondaryText }]}>
                  Tap on Link a Device
                </Text>
              </View>

              <View style={styles.step}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stepNumberText}>4</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.secondaryText }]}>
                  Point your phone to this screen to capture the code
                </Text>
              </View>
            </View>
            
            <ActivityIndicator color={colors.primary} style={styles.loader} />
            <Text style={[styles.waiting, { color: colors.secondaryText }]}>
              Waiting for device to connect...
            </Text>
          </>
        ) : (
          <>
            <View style={styles.codeDisplayContainer}>
              <Text style={[styles.instruction, { color: colors.text }]}>
                Your link code
              </Text>
              
              <View style={[styles.codeBox, { backgroundColor: colors.secondaryBackground }]}>
                <Text style={[styles.codeText, { color: colors.text }]}>
                  {pairingCode}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.copyButton, { backgroundColor: colors.primary }]}
                onPress={handleCopyCode}
              >
                <Ionicons name="copy-outline" size={20} color="#FFFFFF" />
                <Text style={styles.copyButtonText}>Copy Code</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.stepsContainer}>
              <View style={styles.step}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.secondaryText }]}>
                  Open WhatsApp on your phone
                </Text>
              </View>

              <View style={styles.step}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.secondaryText }]}>
                  Tap Menu or Settings and select Linked Devices
                </Text>
              </View>

              <View style={styles.step}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.secondaryText }]}>
                  Tap on Link with Phone Number instead
                </Text>
              </View>

              <View style={styles.step}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stepNumberText}>4</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.secondaryText }]}>
                  Enter the code shown above
                </Text>
              </View>
            </View>

            <ActivityIndicator color={colors.primary} style={styles.loader} />
            <Text style={[styles.waiting, { color: colors.secondaryText }]}>
              Waiting for device to connect...
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  methodContent: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 30,
  },
  qrContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
  },
  instruction: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 25,
    textAlign: 'center',
  },
  stepsContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  loader: {
    marginTop: 20,
  },
  waiting: {
    marginTop: 10,
    fontSize: 14,
  },
  codeDisplayContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  codeBox: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  codeText: {
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 8,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
