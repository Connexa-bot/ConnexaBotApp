import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { getMessages, sendMessage } from '../services/api';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Avatar from '../components/Avatar';

const ChatViewHeader = ({ chatName }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <Avatar name={chatName} size={40} />
    <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '600', marginLeft: 10 }}>
      {chatName}
    </Text>
  </View>
);

export default function ChatViewScreen() {
  const { user } = useAuth();
  const { messages: socketMessages } = useSocket();
  const phone = user?.phone;
  const route = useRoute();
  const navigation = useNavigation();
  const { chatId, chatName } = route.params;

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <ChatViewHeader chatName={chatName} />,
      headerStyle: { backgroundColor: '#1F2C34' },
      headerTintColor: '#FFF',
    });
  }, [navigation, chatName]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const fetchMessageHistory = useCallback(async () => {
    try {
      setError(null);
      const { data } = await getMessages(phone, chatId);
      setMessages(data.messages?.reverse() || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch messages.');
    } finally {
      setLoading(false);
    }
  }, [phone, chatId]);

  useEffect(() => {
    fetchMessageHistory();
  }, [fetchMessageHistory]);

  useEffect(() => {
    const lastSocketMessage = socketMessages[socketMessages.length - 1];
    if (lastSocketMessage?.event === 'new_message' && lastSocketMessage.data.from === chatId) {
      setMessages((prev) => [...prev, lastSocketMessage.data]);
    }
  }, [socketMessages, chatId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const optimisticMessage = {
      key: { id: Date.now().toString(), fromMe: true },
      message: { conversation: newMessage },
      messageTimestamp: Math.floor(Date.now() / 1000),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    const messageToSend = newMessage;
    setNewMessage('');

    try {
      await sendMessage(phone, chatId, messageToSend);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send. Please try again.');
      setMessages((prev) => prev.filter((msg) => msg.key.id !== optimisticMessage.key.id));
    }
  };

  const renderItem = ({ item }) => {
    const isMyMessage = item.key.fromMe;
    const text = item.message?.conversation || item.message?.extendedTextMessage?.text || '';

    return (
      <View style={[styles.msgContainer, isMyMessage ? styles.myMsgContainer : styles.theirMsgContainer]}>
        <View style={[styles.msgBubble, isMyMessage ? styles.myMsgBubble : styles.theirMsgBubble]}>
          <Text style={styles.msgText}>{text}</Text>
          <Text style={styles.msgTime}>{formatTime(item.messageTimestamp * 1000)}</Text>
        </View>
      </View>
    );
  };

  return (
    <ImageBackground source={require('../../assets/images/chat-bg.png')} style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
        {loading ? (
          <ActivityIndicator style={{ flex: 1 }} size="large" color="#00A884" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <FlatList
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => item.key.id}
            style={styles.messageList}
            ListEmptyComponent={<Text style={styles.emptyText}>No messages yet.</Text>}
          />
        )}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="emoticon-happy-outline" size={24} color="#8696A0" style={{ marginLeft: 10 }} />
            <TextInput
              style={styles.input}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Message"
              placeholderTextColor="#8696A0"
            />
            <MaterialCommunityIcons name="paperclip" size={24} color="#8696A0" style={{ marginRight: 15 }} />
            <MaterialCommunityIcons name="camera" size={24} color="#8696A0" style={{ marginRight: 10 }} />
          </View>
          <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E161A' },
  messageList: { paddingHorizontal: 10 },
  msgContainer: { marginVertical: 4, maxWidth: '80%' },
  myMsgContainer: { alignSelf: 'flex-end' },
  theirMsgContainer: { alignSelf: 'flex-start' },
  msgBubble: { padding: 10, borderRadius: 12 },
  myMsgBubble: { backgroundColor: '#005C4B' },
  theirMsgBubble: { backgroundColor: '#202C33' },
  msgText: { color: '#E9EDEF', fontSize: 16 },
  msgTime: { color: '#8696A0', fontSize: 11, alignSelf: 'flex-end', marginTop: 4 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#8696A0' },
  errorText: { flex: 1, textAlign: 'center', color: '#F15C6D', marginTop: 50 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 8, backgroundColor: '#0E161A' },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#202C33',
    borderRadius: 25,
    marginRight: 8,
  },
  input: { flex: 1, height: 45, paddingHorizontal: 12, color: '#E9EDEF', fontSize: 16 },
  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#00A884',
    justifyContent: 'center',
    alignItems: 'center',
  },
});