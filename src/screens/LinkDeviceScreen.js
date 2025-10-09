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
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getConnectionStatus } from '../services/api';
import { storage } from '../utils/storage';

export default function LinkDeviceScreen() {
  const [phone, setPhone] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const { login, qrCode, connectionStatus, updateConnectionStatus, setUser } = useAuth();
  const { colors } = useTheme();

  useEffect(() => {
    let statusInterval;

    if (connectionStatus === 'qr_ready' && phone) {
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

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Link a device</Text>
        
        {!qrCode ? (
          <>
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
                placeholder="Phone Number (e.g., 1234567890)"
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
          </>
        ) : (
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
              Scan QR code
            </Text>
            <Text style={[styles.steps, { color: colors.secondaryText }]}>
              1. Open WhatsApp on your phone{'\n'}
              2. Tap Menu or Settings and select Linked Devices{'\n'}
              3. Tap Link a Device{'\n'}
              4. Point your phone at this screen to scan the code
            </Text>
            
            <ActivityIndicator color={colors.primary} style={styles.loader} />
            <Text style={[styles.waiting, { color: colors.secondaryText }]}>
              Waiting for device to connect...
            </Text>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
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
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  qrContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
  },
  instruction: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  steps: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  loader: {
    marginTop: 30,
  },
  waiting: {
    marginTop: 10,
    fontSize: 14,
  },
});
