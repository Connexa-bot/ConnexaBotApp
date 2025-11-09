
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ImageBackground,
  ActionSheetIOS,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import useNavigationBar from '../hooks/useNavigationBar';
import { useAI } from '../contexts/AIContext';
import { useWallpaper } from '../contexts/WallpaperContext';
import API, { callAPI } from '../services/api';
import ChatHeader from '../components/ChatHeader';
import MessageBubble from '../components/MessageBubble';
import ChatInput from '../components/ChatInput';
import SmartReplyBar from '../components/SmartReplyBar';

export default function ChatViewScreen({ route, navigation }) {
  const { chat } = route.params;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { getChatSettings } = useAI();
  const { getChatWallpaper } = useWallpaper();
  const flatListRef = useRef(null);
  const pollInterval = useRef(null);
  const lastProcessedMessageId = useRef(null);
  const isInitialLoad = useRef(true);

  useNavigationBar();
  const insets = useSafeAreaInsets();

  const aiSettings = getChatSettings(chat.id);

  // Get wallpaper for this chat
  const wallpaper = getChatWallpaper(chat.id);
  
  // Determine background based on wallpaper settings
  const getBackgroundImage = () => {
    if (wallpaper.isPattern) {
      // For WhatsApp auto pattern, use light pattern (color adapts via getBackgroundColor)
      if (wallpaper.uri === 'whatsapp-auto' || wallpaper.theme === 'auto') {
        return require('../../assets/images/whatsapp-bg-light-official.png');
      }
      return wallpaper.uri;
    }
    // For image-based wallpapers
    if (typeof wallpaper.uri === 'string' && wallpaper.uri.startsWith('file://')) {
      return { uri: wallpaper.uri };
    }
    return wallpaper.uri;
  };

  const getBackgroundColor = () => {
    if (wallpaper.isPattern) {
      // Auto pattern: follow app theme
      if (wallpaper.theme === 'auto' || wallpaper.uri === 'whatsapp-auto') {
        return isDark ? '#0B141A' : '#E5DDD5';
      }
      // Theme-specific patterns: use their designated color (wallpaper selection overrides app theme)
      return wallpaper.color;
    }
    
    // For non-pattern wallpapers (solid colors), use the wallpaper's color
    if (wallpaper.color) {
      return wallpaper.color;
    }
    
    // Fallback: use app theme colors
    return isDark ? '#0B141A' : '#E5DDD5';
  };

  const bgImage = getBackgroundImage();
  const bgColor = getBackgroundColor();

  useEffect(() => {
    lastProcessedMessageId.current = null;
    isInitialLoad.current = true;
    
    loadMessages();
    startMessagePolling();

    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, [chat.id]);

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
      const response = await callAPI(API.Message.get(user.phone, chat.id, 50));
      if (response.data?.messages) {
        const newMessages = response.data.messages;
        
        if (isInitialLoad.current) {
          isInitialLoad.current = false;
          if (newMessages.length > 0) {
            const lastMessage = newMessages[newMessages.length - 1];
            lastProcessedMessageId.current = lastMessage.id;
          }
        } else if (aiSettings.autoReplyEnabled && newMessages.length > 0) {
          const lastNewMessage = newMessages[newMessages.length - 1];
          
          if (lastNewMessage && 
              !lastNewMessage.fromMe && 
              lastNewMessage.id !== lastProcessedMessageId.current) {
            lastProcessedMessageId.current = lastNewMessage.id;
            handleAutoReply(lastNewMessage.text);
          }
        }
        
        setMessages(newMessages);
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
      const response = await callAPI(API.AI.smartReply(user.phone, lastMessage.text));
      
      if (response.suggestions) {
        setSmartSuggestions(response.suggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error loading smart suggestions:', error);
    }
  };

  const handleSend = async (text) => {
    try {
      await callAPI(API.Message.send(user.phone, chat.id, text));
      
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
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleAutoReply = async (userMessage) => {
    try {
      const response = await callAPI(API.AI.generate(user.phone, { 
        task: 'summarize', 
        chatId: chat.id, 
        contextWindow: 10 
      }));

      if (response.summary) {
        const replyText = `Auto-reply based on context: ${response.summary}`;
        await callAPI(API.Message.send(user.phone, chat.id, replyText));
        
        const aiMessage = {
          id: Date.now().toString(),
          text: replyText,
          fromMe: true,
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
      if (type === 'image') {
        await callAPI(API.Message.sendImage(user.phone, chat.id, media.uri, media.caption || ''));
      } else if (type === 'video') {
        await callAPI(API.Message.sendVideo(user.phone, chat.id, media.uri, media.caption || ''));
      } else if (type === 'document') {
        await callAPI(API.Message.sendDocument(user.phone, chat.id, media.uri, media.name, media.type));
      }
      loadMessages();
      scrollToBottom();
    } catch (error) {
      console.error('Error sending media:', error);
      Alert.alert('Error', 'Failed to send media');
    }
  };

  const handleVoiceRecord = async (audioUri) => {
    try {
      await callAPI(API.Message.sendAudio(user.phone, chat.id, audioUri, true));
      loadMessages();
      scrollToBottom();
    } catch (error) {
      console.error('Error sending voice:', error);
      Alert.alert('Error', 'Failed to send voice message');
    }
  };

  const handleMessageLongPress = (message) => {
    const options = message.fromMe 
      ? ['React', 'Reply', 'Forward', 'Star', 'Edit', 'Delete', 'Cancel']
      : ['React', 'Reply', 'Forward', 'Star', 'Delete', 'Cancel'];
    const destructiveButtonIndex = message.fromMe ? 5 : 4;
    const cancelButtonIndex = options.length - 1;

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
    if (message.fromMe) {
      switch (actionIndex) {
        case 0: handleReact(message); break;
        case 1: handleReply(message); break;
        case 2: handleForward(message); break;
        case 3: handleStar(message); break;
        case 4: handleEdit(message); break;
        case 5: handleDelete(message); break;
      }
    } else {
      switch (actionIndex) {
        case 0: handleReact(message); break;
        case 1: handleReply(message); break;
        case 2: handleForward(message); break;
        case 3: handleStar(message); break;
        case 4: handleDelete(message); break;
      }
    }
  };

  const handleReply = (message) => {
    Alert.alert('Reply', 'Reply feature coming soon.');
  };

  const handleEdit = async (message) => {
    if (Platform.OS === 'ios') {
      Alert.prompt(
        'Edit Message',
        'Enter new text',
        async (text) => {
          if (text && text.trim()) {
            try {
              const messageKey = message.key || message.id;
              await callAPI(API.Message.edit(user.phone, chat.id, messageKey, text));
              loadMessages();
            } catch (error) {
              console.error('Error editing message:', error);
              Alert.alert('Error', 'Failed to edit message');
            }
          }
        },
        'plain-text',
        message.text
      );
    } else {
      Alert.alert('Edit Message', 'Message editing is available on iOS.');
    }
  };

  const handleForward = (message) => {
    navigation.navigate('ForwardMessage', { message, chatId: chat.id });
  };

  const handleStar = async (message) => {
    try {
      const messageKey = message.key || message.id;
      await callAPI(API.Message.star(user.phone, chat.id, messageKey, true));
      Alert.alert('Success', 'Message starred');
      loadMessages();
    } catch (error) {
      console.error('Error starring message:', error);
      Alert.alert('Error', 'Failed to star message');
    }
  };

  const handleDelete = async (message) => {
    Alert.alert(
      'Delete Message',
      'Delete message for everyone?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete for Me',
          onPress: async () => {
            try {
              const messageKey = message.key || message.id;
              await callAPI(API.Message.delete(user.phone, chat.id, messageKey));
              loadMessages();
            } catch (error) {
              console.error('Error deleting message:', error);
            }
          }
        },
        {
          text: 'Delete for Everyone',
          style: 'destructive',
          onPress: async () => {
            try {
              const messageKey = message.key || message.id;
              await callAPI(API.Message.delete(user.phone, chat.id, messageKey));
              loadMessages();
            } catch (error) {
              console.error('Error deleting message:', error);
            }
          }
        }
      ]
    );
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
            const messageKey = message.key || message.id;
            await callAPI(API.Message.react(user.phone, chat.id, messageKey, emoji));
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
    Alert.alert('Video Call', 'Video calling is not supported.');
  };

  const handleVoiceCall = () => {
    Alert.alert('Voice Call', 'Voice calling is not supported.');
  };

  const handleMore = () => {
    navigation.navigate('ChatSettings', { chat });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
  };

  const groupMessagesByDate = (messages) => {
    const grouped = [];
    let currentDate = null;

    messages.forEach((message) => {
      const messageDate = formatDate(message.timestamp);
      
      if (messageDate !== currentDate) {
        grouped.push({ type: 'date', date: messageDate, id: `date-${message.timestamp}` });
        currentDate = messageDate;
      }
      
      grouped.push({ type: 'message', data: message, id: message.id });
    });

    return grouped;
  };

  const groupedMessages = groupMessagesByDate(messages);

  const renderEmptyState = () => {
    const isContact = chat.isContact !== false;
    
    return (
      <View style={styles.emptyStateContainer}>
        {/* Date */}
        <View style={styles.dateContainer}>
          <View style={[styles.dateBadge, { backgroundColor: isDark ? '#182229' : '#E1F4F3' }]}>
            <Text style={[styles.dateText, { color: isDark ? '#8696A0' : '#54656F' }]}>
              {formatDate(Date.now() / 1000)}
            </Text>
          </View>
        </View>

        {/* Encryption Message */}
        <View style={[styles.encryptionBanner, { backgroundColor: isDark ? '#182229' : '#FFF4C4' }]}>
          <Ionicons name="lock-closed" size={14} color={isDark ? '#8696A0' : '#54656F'} />
          <Text style={[styles.encryptionText, { color: isDark ? '#8696A0' : '#54656F' }]}>
            Messages and calls are end-to-end encrypted. Only people in this chat can read, listen to, or share them.{' '}
            <Text style={{ color: '#00A884' }}>Learn more</Text>.
          </Text>
        </View>

        {/* Contact Info */}
        <View style={styles.contactInfoContainer}>
          <View style={[styles.largeAvatar, { backgroundColor: colors.primary }]}>
            {chat.profilePic ? (
              <Image source={{ uri: chat.profilePic }} style={styles.largeAvatarImage} />
            ) : (
              <Text style={styles.largeAvatarText}>
                {chat.name?.charAt(0).toUpperCase() || chat.id?.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>

          <Text style={[styles.contactName, { color: colors.text }]}>{chat.name || chat.id}</Text>
          
          {chat.email && (
            <Text style={[styles.contactEmail, { color: colors.secondaryText }]}>
              ~ {chat.email}
            </Text>
          )}

          {!isContact && (
            <Text style={[styles.notContactText, { color: colors.secondaryText }]}>
              Not a contact • No common groups
            </Text>
          )}

          {/* Safety Tools */}
          <TouchableOpacity style={styles.safetyToolsButton}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#00A884" />
            <Text style={styles.safetyToolsText}>Safety tools</Text>
          </TouchableOpacity>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="close-circle-outline" size={24} color="#E53935" />
              <Text style={[styles.actionButtonText, { color: '#E53935' }]}>Block</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="person-add-outline" size={24} color="#00A884" />
              <Text style={[styles.actionButtonText, { color: '#00A884' }]}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Disappearing Message Info */}
        <View style={[styles.disappearingInfo, { backgroundColor: isDark ? '#182229' : '#E1F4F3' }]}>
          <Ionicons name="timer-outline" size={16} color={isDark ? '#8696A0' : '#54656F'} />
          <Text style={[styles.disappearingText, { color: isDark ? '#8696A0' : '#54656F' }]}>
            You use a default timer for disappearing messages in new chats. New messages will disappear from this chat 90 days after they're sent, except when kept. Tap to set your own default timer
          </Text>
        </View>
      </View>
    );
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
        style={[styles.flex, { paddingBottom: insets.bottom }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ImageBackground
          source={bgImage}
          style={[styles.messagesContainer, { 
            backgroundColor: bgColor
          }]}
          resizeMode="repeat"
        >
          {messages.length === 0 ? (
            <View style={styles.emptyScrollContent}>
              {renderEmptyState()}
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={groupedMessages}
              renderItem={({ item }) => {
                if (item.type === 'date') {
                  return (
                    <View style={styles.dateContainer}>
                      <View style={[styles.dateBadge, { backgroundColor: isDark ? '#182229' : '#E1F4F3' }]}>
                        <Text style={[styles.dateText, { color: isDark ? '#8696A0' : '#54656F' }]}>
                          {item.date}
                        </Text>
                      </View>
                    </View>
                  );
                }
                return (
                  <MessageBubble
                    message={item.data}
                    onLongPress={handleMessageLongPress}
                    onReact={handleReact}
                    isGroupChat={chat.isGroup || false}
                    isChannel={chat.isChannel || false}
                  />
                );
              }}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesList}
              onContentSizeChange={scrollToBottom}
            />
          )}
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
  emptyScrollContent: {
    flexGrow: 1,
  },
  emptyStateContainer: {
    paddingVertical: 16,
  },
  dateContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  dateBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  encryptionBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  encryptionText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  contactInfoContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  largeAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  largeAvatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  largeAvatarText: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '400',
  },
  contactName: {
    fontSize: 22,
    fontWeight: '500',
    marginBottom: 4,
  },
  contactEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  notContactText: {
    fontSize: 14,
    marginBottom: 16,
  },
  safetyToolsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 20,
    gap: 6,
  },
  safetyToolsText: {
    color: '#00A884',
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 32,
  },
  actionButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E9EDEF',
    minWidth: 120,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 4,
  },
  disappearingInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 16,
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  disappearingText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
