import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useThemeContext } from '../contexts/ThemeContext';
import { useSocket } from '../contexts/SocketContext';
import { getMessages, sendMessage } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function ChatViewScreen() {
  const { theme } = useThemeContext();
  const { messages: socketMessages, phone } = useSocket();
  const route = useRoute();
  const { chatId } = route.params;

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  const fetchMessageHistory = useCallback(async () => {
    try {
      setError(null);
      const { data } = await getMessages(phone, chatId);
      setMessages(data.messages || []);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch messages.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [phone, chatId]);

  useEffect(() => {
    fetchMessageHistory();
  }, [fetchMessageHistory]);

  useEffect(() => {
    const lastSocketMessage = socketMessages[socketMessages.length - 1];
    if (lastSocketMessage?.event === 'new_message') {
      const receivedMessage = lastSocketMessage.data;
      if (receivedMessage.from === chatId) {
        setMessages(prevMessages => [receivedMessage, ...prevMessages]);
      }
    }
  }, [socketMessages, chatId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const optimisticMessage = {
      id: Date.now().toString(),
      content: newMessage,
      isBot: true,
      timestamp: new Date().toISOString(),
      from: phone,
      to: chatId,
    };

    setMessages(prevMessages => [optimisticMessage, ...prevMessages]);
    const messageToSend = newMessage;
    setNewMessage('');

    try {
      await sendMessage(phone, chatId, messageToSend);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message. Please try again.');
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== optimisticMessage.id));
    }
  };

  const renderItem = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.isBot ? styles.botMessageContainer : styles.userMessageContainer
    ]}>
      <View style={[
        styles.messageBubble,
        item.isBot ? { backgroundColor: theme.colors.primary } : { backgroundColor: '#E1E1E1' }
      ]}>
        <Text style={[
          styles.messageText,
          item.isBot ? { color: 'white' } : { color: 'black' }
        ]}>
          {item.content}
        </Text>
        <Text style={[
            styles.messageTime,
            item.isBot ? {color: '#A2D4C8'} : {color: 'gray'}
        ]}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return <ActivityIndicator style={styles.centered} size="large" color={theme.colors.primary} />;
  }

  if (error) {
    return <Text style={[styles.centered, { color: 'red' }]}>{error}</Text>;
  }

  return (
    <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={90}
    >
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        inverted
        style={styles.messageList}
        ListEmptyComponent={<Text style={[styles.emptyText, {color: theme.colors.text}]}>No messages yet.</Text>}
      />
      <View style={styles.inputContainer}>
        <TextInput
            style={[styles.input, {backgroundColor: theme.colors.card, color: theme.colors.text}]}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor="gray"
        />
        <TouchableOpacity onPress={handleSendMessage} style={[styles.sendButton, {backgroundColor: theme.colors.primary}]}>
            <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  messageList: {
      flex: 1,
  },
  messageContainer: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginVertical: 4,
  },
  userMessageContainer: {
    alignItems: 'flex-start',
  },
  botMessageContainer: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    maxWidth: '80%',
  },
  messageText: {
    fontSize: 16,
  },
  messageTime: {
      fontSize: 11,
      marginTop: 4,
      textAlign: 'right',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      borderTopWidth: 1,
      borderColor: '#ccc',
  },
  input: {
      flex: 1,
      height: 40,
      borderRadius: 20,
      paddingHorizontal: 15,
      marginRight: 10,
  },
  sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
  }
});