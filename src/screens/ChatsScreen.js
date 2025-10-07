import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Button,
} from 'react-native';
import { useSocket } from '../contexts/SocketContext';
import { getChats } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import Avatar from '../components/Avatar';
import { MaterialIcons } from '@expo/vector-icons';

export default function ChatsScreen() {
  const { messages, phone, isConnected } = useSocket(); // ✅ Added isConnected
  const navigation = useNavigation();

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const fetchChatList = useCallback(async () => {
    setLoading(true);
    try {
      setError(null);
      const { data } = await getChats(phone);
      const sortedChats = (data.chats || []).sort(
        (a, b) => (b.conversationTimestamp || 0) - (a.conversationTimestamp || 0)
      );
      setChats(sortedChats);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.message || 'Failed to fetch chats.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [phone]);

  useEffect(() => {
    if (isConnected) {
      fetchChatList();
    }
  }, [isConnected, fetchChatList]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.event === 'new_message') {
      const newMessage = lastMessage.data;
      const chatId = newMessage.from;

      setChats((prevChats) => {
        const existingChatIndex = prevChats.findIndex((chat) => chat.id === chatId);
        let updatedChats = [...prevChats];

        if (existingChatIndex !== -1) {
          const existingChat = { ...updatedChats[existingChatIndex] };
          existingChat.lastMessage = newMessage.content;
          existingChat.conversationTimestamp = Math.floor(Date.now() / 1000);
          existingChat.unreadCount = (existingChat.unreadCount || 0) + 1;
          updatedChats.splice(existingChatIndex, 1);
          updatedChats.unshift(existingChat);
          return updatedChats;
        } else {
          fetchChatList(); // Fetch if it’s a new chat
          return prevChats;
        }
      });
    }
  }, [messages, fetchChatList]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('ChatView', {
          chatId: item.id,
          chatName: item.name,
          phone,
        })
      }
    >
      <View style={styles.chatItem}>
        <Avatar name={item.name} />
        <View style={styles.chatContent}>
          <Text style={styles.chatName}>{item.name || 'Unknown'}</Text>
          <Text style={styles.chatMessage} numberOfLines={1}>
            {item.lastMessage?.text || 'No messages yet'}
          </Text>
        </View>
        <View style={styles.chatMeta}>
          <Text style={styles.chatTime}>
            {formatTime(item.conversationTimestamp)}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: '#111B21' }]}>
        <ActivityIndicator size="large" color="#00A884" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: '#111B21' }]}>
        <Text style={{ color: '#F15C6D' }}>{error}</Text>
        <Button title="Retry" onPress={fetchChatList} color="#00A884" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No chats found.</Text>
        }
        onRefresh={fetchChatList}
        refreshing={loading}
      />
      <TouchableOpacity style={styles.fab}>
        <MaterialIcons name="chat" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111B21',
  },
  container: {
    flex: 1,
    backgroundColor: '#111B21',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(134, 150, 160, 0.15)',
  },
  chatContent: {
    flex: 1,
    marginLeft: 15,
  },
  chatName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#E9EDEF',
  },
  chatMessage: {
    fontSize: 15,
    color: '#8696A0',
    marginTop: 2,
  },
  chatMeta: {
    alignItems: 'flex-end',
  },
  chatTime: {
    fontSize: 12,
    color: '#8696A0',
  },
  unreadBadge: {
    backgroundColor: '#25D366',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  unreadText: {
    color: '#111B21',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#8696A0',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#00A884',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});
