import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Platform,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { useTheme } from '../contexts/ThemeContext';

export default function ChatInput({ onSendMessage, onSendMedia, onVoiceRecord }) {
  const [message, setMessage] = useState('');
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingInterval = useRef(null);
  const { colors } = useTheme();

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        onSendMedia?.(result.assets[0], 'image');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
    setShowMediaOptions(false);
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        onSendMedia?.(result.assets[0], 'image');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
    setShowMediaOptions(false);
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        onSendMedia?.(result.assets[0], 'document');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
    setShowMediaOptions(false);
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Microphone permission is required');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);
      
      recordingInterval.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
      
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri && recordingDuration > 0) {
        onVoiceRecord?.(uri);
      }
      
      setRecording(null);
      setRecordingDuration(0);
    } catch (error) {
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.inputBackground || '#1F2C34' }]}>
      {showMediaOptions && (
        <View style={[styles.mediaOptions, { backgroundColor: colors.background }]}>
          <TouchableOpacity style={styles.mediaButton} onPress={pickDocument}>
            <View style={[styles.mediaIcon, { backgroundColor: '#7F66FF' }]}>
              <Ionicons name="document" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.mediaButton} onPress={takePhoto}>
            <View style={[styles.mediaIcon, { backgroundColor: '#FF3B77' }]}>
              <Ionicons name="camera" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
            <View style={[styles.mediaIcon, { backgroundColor: '#00A884' }]}>
              <Ionicons name="image" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
      )}

      {isRecording && (
        <View style={[styles.recordingOverlay, { backgroundColor: colors.inputBackground || '#1F2C34' }]}>
          <TouchableOpacity onPress={stopRecording} style={styles.cancelRecording}>
            <Ionicons name="close" size={24} color="#FF3B30" />
          </TouchableOpacity>
          <View style={styles.recordingInfo}>
            <View style={styles.recordingDot} />
            <Text style={[styles.recordingTime, { color: colors.text }]}>
              {formatRecordingTime(recordingDuration)}
            </Text>
          </View>
          <Text style={[styles.swipeText, { color: colors.secondaryText }]}>
            ← Slide to cancel
          </Text>
        </View>
      )}

      <View style={styles.inputRow}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => setShowMediaOptions(!showMediaOptions)}
        >
          <Ionicons 
            name={showMediaOptions ? "close" : "add"} 
            size={28} 
            color={colors.primary} 
          />
        </TouchableOpacity>

        <View style={[styles.inputContainer, { backgroundColor: '#2A3942' }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={message}
            onChangeText={setMessage}
            placeholder="Message"
            placeholderTextColor="#8696A0"
            multiline
            maxLength={4096}
          />
          
          <TouchableOpacity style={styles.emojiButton}>
            <Ionicons name="happy-outline" size={24} color="#8696A0" />
          </TouchableOpacity>
        </View>

        {message.trim() ? (
          <TouchableOpacity 
            style={[styles.sendButton, { backgroundColor: colors.primary }]}
            onPress={handleSend}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.sendButton, { backgroundColor: colors.primary }]}
            onLongPress={startRecording}
            onPressOut={stopRecording}
            delayLongPress={200}
          >
            <Ionicons name="mic" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  mediaOptions: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    marginBottom: 8,
    gap: 12,
  },
  recordingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  cancelRecording: {
    padding: 8,
  },
  recordingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    marginRight: 8,
  },
  recordingTime: {
    fontSize: 16,
    fontWeight: '500',
  },
  swipeText: {
    fontSize: 14,
    marginRight: 16,
  },
  mediaButton: {
    marginRight: 20,
    alignItems: 'center',
  },
  mediaIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  iconButton: {
    padding: 8,
    marginRight: 4,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingTop: Platform.OS === 'ios' ? 8 : 0,
  },
  emojiButton: {
    padding: 4,
    marginLeft: 4,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
