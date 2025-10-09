import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ImageBackground,
  ActionSheetIOS,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useWallpaper } from '../contexts/WallpaperContext';
import { useAI } from '../contexts/AIContext';
import { 
  sendMessage, 
  getMessages, 
  sendMediaMessage,
  reactToMessage,
  getSmartReplies,
  autoReplyAI,
  analyzeImageAI,
  transcribeAudioAI,
} from '../services/api';
import ChatHeader from '../components/ChatHeader';
import MessageBubble from '../components/MessageBubble';
import ChatInput from '../components/ChatInput';
import SmartReplyBar from '../components/SmartReplyBar';
import * as FileSystem from 'expo-file-system';

export default function ChatViewScreen({ route, navigation }) {
  const { chat } = route.params;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { colors } = useTheme();
  const { user } = useAuth();
  const { getChatWallpaper } = useWallpaper();
  const { getChatSettings } = useAI();
  const flatListRef = useRef(null);
  const pollInterval = useRef(null);

  const wallpaper = getChatWallpaper(chat.id);
  const aiSettings = getChatSettings(chat.id);

  useEffect(() => {
    loadMessages();
    startMessagePolling();

    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0 && aiSettings.smartRepliesEnabled) {
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage.fromMe) {
        loadSmartSuggestions(lastMessage);
      }
    }
  }, [messages]);

  const startMessagePolling = () => {
    pollInterval.current = setInterval(() => {
      loadMessages(true);
    }, 3000);
  };

  const loadMessages = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await getMessages(user.phone, chat.id, 50);
      if (response.data?.messages) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      if (!silent) {
        setMessages([]);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const loadSmartSuggestions = async (lastMessage) => {
    try {
      const response = await getSmartReplies(user.phone, chat.id, {
        lastMessage: lastMessage.text,
        senderName: chat.name || 'Contact',
        relationship: 'contact',
      });
      
      if (response.data?.suggestions) {
        setSmartSuggestions(response.data.suggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error loading smart suggestions:', error);
    }
  };

  const handleSend = async (text) => {
    try {
      await sendMessage(user.phone, chat.id, text);
      
      const newMessage = {
        id: Date.now().toString(),
        text,
        fromMe: true,
        timestamp: Date.now() / 1000,
        status: 'pending',
      };
      
      setMessages((prev) => [...prev, newMessage]);
      setShowSuggestions(false);
      scrollToBottom();

      if (aiSettings.autoReplyEnabled) {
        setTimeout(() => handleAutoReply(text), 1000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleAutoReply = async (userMessage) => {
    try {
      const response = await autoReplyAI(user.phone, chat.id, userMessage, {
        personality: aiSettings.personality,
        language: aiSettings.language,
        contextWindow: aiSettings.contextWindow,
      });

      if (response.data?.shouldSend && response.data.confidence > 0.7) {
        await sendMessage(user.phone, chat.id, response.data.reply);
        
        const aiMessage = {
          id: Date.now().toString(),
          text: response.data.reply,
          fromMe: false,
          timestamp: Date.now() / 1000,
          aiGenerated: true,
        };
        
        setMessages((prev) => [...prev, aiMessage]);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error with auto-reply:', error);
    }
  };

  const handleSendMedia = async (media, type) => {
    try {
      let base64Data;
      
      if (type === 'image' && media.uri) {
        if (aiSettings.imageAnalysisEnabled) {
          base64Data = await FileSystem.readAsStringAsync(media.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          
          const analysis = await analyzeImageAI(
            user.phone, 
            `data:image/jpeg;base64,${base64Data}`,
            'Describe this image briefly'
          );
          
          if (analysis.data?.analysis) {
            Alert.alert('AI Image Analysis', analysis.data.analysis);
          }
        }
        
        await sendMediaMessage(user.phone, chat.id, media.uri, type, media.caption);
      } else if (type === 'document') {
        await sendMediaMessage(user.phone, chat.id, media.uri, type);
      }

      loadMessages();
    } catch (error) {
      console.error('Error sending media:', error);
      Alert.alert('Error', 'Failed to send media');
    }
  };

  const handleVoiceRecord = async (audioUri) => {
    try {
      if (aiSettings.voiceTranscriptionEnabled) {
        const transcription = await transcribeAudioAI(user.phone, audioUri);
        
        if (transcription.data?.text) {
          Alert.alert(
            'Voice Transcription',
            transcription.data.text,
            [
              { text: 'Send Transcription', onPress: () => handleSend(transcription.data.text) },
              { text: 'Send Audio', onPress: () => sendMediaMessage(user.phone, chat.id, audioUri, 'audio') },
              { text: 'Cancel', style: 'cancel' },
            ]
          );
          return;
        }
      }

      await sendMediaMessage(user.phone, chat.id, audioUri, 'audio');
      loadMessages();
    } catch (error) {
      console.error('Error sending voice:', error);
      Alert.alert('Error', 'Failed to send voice message');
    }
  };

  const handleMessageLongPress = (message) => {
    const options = ['React', 'Forward', 'Star', 'Delete', 'Cancel'];
    const destructiveButtonIndex = 3;
    const cancelButtonIndex = 4;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          destructiveButtonIndex,
          cancelButtonIndex,
        },
        (buttonIndex) => {
          handleMessageAction(message, buttonIndex);
        }
      );
    } else {
      Alert.alert(
        'Message Actions',
        'Choose an action',
        options.slice(0, -1).map((option, index) => ({
          text: option,
          style: index === destructiveButtonIndex ? 'destructive' : 'default',
          onPress: () => handleMessageAction(message, index),
        }))
      );
    }
  };

  const handleMessageAction = async (message, actionIndex) => {
    switch (actionIndex) {
      case 0: // React
        handleReact(message);
        break;
      case 1: // Forward
        // Implement forward
        break;
      case 2: // Star
        // Implement star
        break;
      case 3: // Delete
        // Implement delete
        break;
    }
  };

  const handleReact = async (message) => {
    const emojis = ['❤️', '😂', '😮', '😢', '🙏', '👍'];
    
    Alert.alert(
      'React to Message',
      'Choose a reaction',
      emojis.map(emoji => ({
        text: emoji,
        onPress: async () => {
          try {
            await reactToMessage(user.phone, chat.id, message.key, emoji);
            loadMessages();
          } catch (error) {
            console.error('Error reacting to message:', error);
          }
        },
      })).concat([{ text: 'Cancel', style: 'cancel' }])
    );
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleVideoCall = () => {
    Alert.alert(
      'Video Call',
      'Video calling is not supported by the WhatsApp library. Only call history viewing is available.',
      [{ text: 'OK' }]
    );
  };

  const handleVoiceCall = () => {
    Alert.alert(
      'Voice Call',
      'Voice calling is not supported by the WhatsApp library. Only call history viewing is available.',
      [{ text: 'OK' }]
    );
  };

  const handleMore = () => {
    navigation.navigate('ChatSettings', { chat });
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ChatHeader 
        chat={chat}
        onVideoCall={handleVideoCall}
        onVoiceCall={handleVoiceCall}
        onMore={handleMore}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ImageBackground
          source={wallpaper.uri ? { uri: wallpaper.uri } : null}
          style={[styles.messagesContainer, { backgroundColor: wallpaper.color || colors.chatBackground }]}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={({ item }) => (
              <MessageBubble
                message={item}
                onLongPress={handleMessageLongPress}
                onReact={handleReact}
              />
            )}
            keyExtractor={(item, index) => item.id || index.toString()}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={scrollToBottom}
          />
        </ImageBackground>

        {showSuggestions && smartSuggestions.length > 0 && (
          <SmartReplyBar
            suggestions={smartSuggestions}
            onSelectSuggestion={(text) => {
              handleSend(text);
              setShowSuggestions(false);
            }}
            onDismiss={() => setShowSuggestions(false)}
          />
        )}

        <ChatInput
          onSendMessage={handleSend}
          onSendMedia={handleSendMedia}
          onVoiceRecord={handleVoiceRecord}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    paddingVertical: 8,
  },
});
