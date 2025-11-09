import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import API, { callAPI } from '../services/api';

const { width, height } = Dimensions.get('window');

const STATUS_COLORS = [
  '#128C7E',
  '#075E54',
  '#25D366',
  '#DCF8C6',
  '#34B7F1',
  '#7C4DFF',
  '#E91E63',
  '#FF9800',
  '#795548',
  '#607D8B',
  '#000000',
  '#FFFFFF',
];

export default function StatusPostScreen({ navigation, route }) {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { mediaType, mediaUri } = route.params || {};
  
  const [statusText, setStatusText] = useState('');
  const [backgroundColor, setBackgroundColor] = useState(STATUS_COLORS[0]);
  const [caption, setCaption] = useState('');
  const [posting, setPosting] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(mediaUri);

  const isColorLight = (hexColor) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155;
  };

  const statusBarStyle = selectedMedia 
    ? 'light-content' 
    : (isColorLight(backgroundColor) ? 'dark-content' : 'light-content');

  const handlePostStatus = async () => {
    if (!statusText.trim() && !selectedMedia) return;

    setPosting(true);
    try {
      if (selectedMedia && mediaType === 'image') {
        await callAPI(API.Status.postImage(
          user.phone,
          selectedMedia,
          caption
        ));
      } else if (selectedMedia && mediaType === 'video') {
        await callAPI(API.Status.postVideo(
          user.phone,
          selectedMedia,
          caption
        ));
      } else if (statusText.trim()) {
        await callAPI(API.Status.postText(
          user.phone,
          statusText,
          [],
          backgroundColor
        ));
      }
      navigation.goBack();
    } catch (error) {
      console.error('Error posting status:', error);
    } finally {
      setPosting(false);
    }
  };

  const renderTextStatusEditor = () => (
    <View style={[styles.textStatusContainer, { backgroundColor }]}>
      <TextInput
        style={styles.textStatusInput}
        placeholder="Type a status"
        placeholderTextColor="rgba(255,255,255,0.7)"
        value={statusText}
        onChangeText={setStatusText}
        multiline
        maxLength={700}
        autoFocus
      />
      
      <View style={styles.colorPicker}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {STATUS_COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                backgroundColor === color && styles.selectedColor
              ]}
              onPress={() => setBackgroundColor(color)}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const renderMediaStatusEditor = () => (
    <View style={styles.mediaContainer}>
      <Image
        source={{ uri: selectedMedia }}
        style={styles.mediaPreview}
        resizeMode={mediaType === 'video' ? 'contain' : 'cover'}
      />
      <View style={styles.captionContainer}>
        <TextInput
          style={[styles.captionInput, { color: '#FFFFFF', backgroundColor: 'rgba(0,0,0,0.3)' }]}
          placeholder="Add a caption..."
          placeholderTextColor="rgba(255,255,255,0.7)"
          value={caption}
          onChangeText={setCaption}
          maxLength={700}
        />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: selectedMedia ? '#000' : backgroundColor }]}>
      <StatusBar 
        barStyle={statusBarStyle}
        backgroundColor={selectedMedia ? '#000' : backgroundColor}
        translucent={false}
      />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="color-palette-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="text-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="happy-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}
      >
        {selectedMedia ? renderMediaStatusEditor() : renderTextStatusEditor()}
      </KeyboardAvoidingView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.privacyContainer}>
          <Ionicons name="eye-outline" size={20} color="#FFFFFF" />
          <Text style={styles.privacyText}>My contacts</Text>
          <Ionicons name="chevron-down" size={16} color="#FFFFFF" />
        </View>
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: colors.primary || '#25D366' }, posting && styles.sendButtonDisabled]}
          onPress={handlePostStatus}
          disabled={posting}
        >
          <Ionicons name="send" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    padding: 4,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  textStatusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  textStatusInput: {
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
    width: '100%',
  },
  colorPicker: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#FFFFFF',
    borderWidth: 3,
  },
  mediaContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  mediaPreview: {
    width: '100%',
    height: '100%',
  },
  captionContainer: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
  },
  captionInput: {
    fontSize: 16,
    padding: 12,
    borderRadius: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  privacyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  privacyText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  sendButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
