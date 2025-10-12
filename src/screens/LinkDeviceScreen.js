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
  ScrollView,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { callAPI, API_ENDPOINTS } from '../services/api';
import { storage } from '../utils/storage';

export default function LinkDeviceScreen() {
  const [phone, setPhone] = useState('');
  const [cleanPhone, setCleanPhone] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showLinkScreen, setShowLinkScreen] = useState(false);
  const [linkMethod, setLinkMethod] = useState('qr');
  const [pairingCode, setPairingCode] = useState('');
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);

  const { login, qrCode, linkCode, connectionStatus, updateConnectionStatus, setUser } = useAuth();
  const { colors } = useTheme();

  useEffect(() => {
    if (linkCode && linkCode !== pairingCode) {
      console.log('🔗 Setting pairing code from context:', linkCode);
      setPairingCode(linkCode);
    }
  }, [linkCode]);

  useEffect(() => {
    console.log('🔹 QR Code state changed:', qrCode ? 'Available' : 'Not available');
    console.log('🔹 Connection status:', connectionStatus);
    
    if (qrCode && connectionStatus === 'qr_ready' && !showLinkScreen) {
      console.log('✅ Auto-showing link screen because QR is ready');
      setShowLinkScreen(true);
    }
  }, [qrCode, connectionStatus]);

  useEffect(() => {
    let statusInterval;
    let pollCount = 0;
    const MAX_POLLS = 60;

    if (showLinkScreen && cleanPhone) {
      console.log('🔄 Starting polling for connection status for phone:', cleanPhone);
      setIsCheckingConnection(true);

      statusInterval = setInterval(async () => {
        pollCount++;
        console.log(`🔍 Poll #${pollCount}: Checking status for`, cleanPhone);

        try {
          const data = await callAPI(API_ENDPOINTS.GET_STATUS(cleanPhone));
          
          console.log('📊 Full status response:', JSON.stringify(data, null, 2));

          if (data?.linkCode && data.linkCode !== pairingCode) {
            console.log('🔗 Updating pairingCode from backend:', data.linkCode);
            setPairingCode(data.linkCode);
          }

          const isConnected = 
            data?.status === 'connected' || 
            data?.connected === true ||
            data?.isConnected === true ||
            data?.ready === true ||
            data?.authenticated === true;

          console.log('🔍 Connection check:', {
            'data.status': data?.status,
            'data.connected': data?.connected,
            'data.isConnected': data?.isConnected,
            'data.ready': data?.ready,
            'data.authenticated': data?.authenticated,
            'isConnected': isConnected
          });

          if (isConnected) {
            console.log('✅ Device connected successfully!');
            console.log('📱 User data:', data?.user);
            
            setIsCheckingConnection(false);
            clearInterval(statusInterval);
            
            await storage.setItem('userPhone', cleanPhone);
            console.log('💾 Saved phone to storage:', cleanPhone);
            
            updateConnectionStatus('connected');
            console.log('🔄 Updated connection status to: connected');
            
            setUser({ phone: cleanPhone, ...data?.user });
            console.log('👤 Set user in AuthContext:', { phone: cleanPhone });
            
            Alert.alert('Success', 'WhatsApp connected successfully!');
          } else if (pollCount >= MAX_POLLS) {
            console.log('⏱️ Polling timeout reached');
            setIsCheckingConnection(false);
            clearInterval(statusInterval);
            Alert.alert(
              'Timeout',
              'Connection attempt timed out. Please try again.',
              [{ text: 'OK', onPress: handleBack }]
            );
          }
        } catch (error) {
          console.error('❌ Status check error:', error);
          console.error('❌ Error details:', error.message);
          
          if (pollCount >= MAX_POLLS) {
            setIsCheckingConnection(false);
            clearInterval(statusInterval);
            Alert.alert(
              'Connection Error',
              'Unable to verify connection. Please try again.',
              [{ text: 'OK', onPress: handleBack }]
            );
          }
        }
      }, 3000);
    }

    return () => {
      if (statusInterval) {
        console.log('🛑 Clearing polling interval');
        clearInterval(statusInterval);
      }
    };
  }, [showLinkScreen, cleanPhone]);

  const handleConnect = async () => {
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    const normalized = phone.replace(/\D/g, '');
    
    if (normalized.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    console.log('📞 Attempting to connect for phone:', normalized);
    setCleanPhone(normalized);

    setIsConnecting(true);
    const result = await login(normalized);
    setIsConnecting(false);

    console.log('📋 Login result:', JSON.stringify(result));

    if (!result || !result.success) {
      console.log('❌ Login failed:', result?.error || 'Unknown error');
      Alert.alert('Connection Failed', result?.error || 'Unable to connect. Try again.');
      return;
    }

    if (result.linkCode) {
      console.log('🔗 Backend returned linkCode:', result.linkCode);
      setPairingCode(result.linkCode);
      setLinkMethod('code');
    }

    if (result.linkCode || result.qrCode) {
      console.log('✅ Showing link screen now (have linkCode or qrCode)');
      setShowLinkScreen(true);
    } else {
      console.log('⚠️ Success but no linkCode or qrCode yet - will auto-show when ready');
    }
  };

  const handleCopyCode = async () => {
    if (!pairingCode) return;
    await Clipboard.setStringAsync(pairingCode);
    Alert.alert('Copied', 'Link code copied to clipboard');
    console.log('📋 Copied link code to clipboard:', pairingCode);
  };

  const handleBack = () => {
    console.log('⬅️ Returning to phone input screen');
    setShowLinkScreen(false);
    setIsCheckingConnection(false);
    updateConnectionStatus('disconnected');
    setPhone('');
    setCleanPhone('');
    setPairingCode('');
  };

  if (!showLinkScreen) {
    return (
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <Ionicons name="phone-portrait-outline" size={80} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>Link your device</Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            Enter your phone number to link your WhatsApp account
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.secondaryBackground,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Phone Number (e.g., 2349154347487)"
              placeholderTextColor={colors.secondaryText}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              editable={!isConnecting}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colors.primary, opacity: isConnecting ? 0.6 : 1 },
            ]}
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
              Make sure to connect twice if the backend is asleep
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

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
            linkMethod === 'qr' && { borderBottomColor: colors.primary, borderBottomWidth: 3 },
          ]}
          onPress={() => {
            console.log('🔄 Switched to QR method');
            setLinkMethod('qr');
          }}
        >
          <Text
            style={[
              styles.tabText,
              { color: linkMethod === 'qr' ? colors.text : colors.secondaryText },
            ]}
          >
            QR Code
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            linkMethod === 'code' && { borderBottomColor: colors.primary, borderBottomWidth: 3 },
          ]}
          onPress={() => {
            console.log('🔄 Switched to Link Code method');
            setLinkMethod('code');
          }}
        >
          <Text
            style={[
              styles.tabText,
              { color: linkMethod === 'code' ? colors.text : colors.secondaryText },
            ]}
          >
            Link with Code
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.methodContent} contentContainerStyle={styles.methodContentContainer}>
        {isCheckingConnection && (
          <View style={[styles.statusBanner, { backgroundColor: colors.primary + '20' }]}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.statusText, { color: colors.primary }]}>
              Waiting for WhatsApp connection...
            </Text>
          </View>
        )}

        {linkMethod === 'qr' ? (
          <>
            {qrCode ? (
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
                    <Text style={[styles.stepText, { color: colors.text }]}>
                      Open WhatsApp on your phone
                    </Text>
                  </View>

                  <View style={styles.step}>
                    <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                      <Text style={styles.stepNumberText}>2</Text>
                    </View>
                    <Text style={[styles.stepText, { color: colors.text }]}>
                      Tap Menu (⋮) or Settings and select Linked Devices
                    </Text>
                  </View>

                  <View style={styles.step}>
                    <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                      <Text style={styles.stepNumberText}>3</Text>
                    </View>
                    <Text style={[styles.stepText, { color: colors.text }]}>
                      Tap "Link a Device" and scan this QR code
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
                  Generating QR code...
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            <View style={styles.codeDisplayContainer}>
              <Text style={[styles.instruction, { color: colors.text }]}>Your link code</Text>

              <View style={[styles.codeBox, { backgroundColor: colors.secondaryBackground }]}>
                <Text style={[styles.codeText, { color: colors.text }]}>
                  {pairingCode || '--------'}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.copyButton, { backgroundColor: colors.primary }]}
                onPress={handleCopyCode}
                disabled={!pairingCode}
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
                <Text style={[styles.stepText, { color: colors.text }]}>
                  Open WhatsApp on your phone
                </Text>
              </View>

              <View style={styles.step}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.text }]}>
                  Tap Menu (⋮) or Settings and select Linked Devices
                </Text>
              </View>

              <View style={styles.step}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.text }]}>
                  Tap "Link with phone number instead" and enter this code
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 30, paddingHorizontal: 20 },
  inputContainer: { width: '100%', marginBottom: 20 },
  input: { width: '100%', padding: 15, borderRadius: 8, fontSize: 16, borderWidth: 1 },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 10,
  },
  infoText: { flex: 1, fontSize: 14, lineHeight: 20 },
  tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E5E5' },
  tab: { flex: 1, paddingVertical: 16, alignItems: 'center' },
  tabText: { fontSize: 16, fontWeight: '600' },
  methodContent: { flex: 1 },
  methodContentContainer: { alignItems: 'center', paddingTop: 30, paddingBottom: 40 },
  qrContainer: { padding: 20, borderRadius: 12, marginBottom: 30 },
  instruction: { fontSize: 20, fontWeight: '600', marginBottom: 25, textAlign: 'center' },
  stepsContainer: { width: '100%', paddingHorizontal: 20, marginBottom: 20 },
  step: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  stepText: { flex: 1, fontSize: 15, lineHeight: 22 },
  codeDisplayContainer: { alignItems: 'center', marginBottom: 30 },
  codeBox: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  codeText: { fontSize: 36, fontWeight: 'bold', letterSpacing: 8 },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  copyButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  loadingContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  loadingText: { marginTop: 20, fontSize: 16 },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 10,
    width: '90%',
  },
  statusText: { fontSize: 14, fontWeight: '500' },
});
