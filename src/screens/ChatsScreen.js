import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Button } from 'react-native';
import { useThemeContext } from '../contexts/ThemeContext';
import { useSocket } from '../contexts/SocketContext';
import { getChats } from '../services/api';
import { useNavigation } from '@react-navigation/native';

export default function ChatsScreen() {
  const { theme } = useThemeContext();
  const { messages, phone } = useSocket();
  const navigation = useNavigation();

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchChatList = useCallback(async () => {
    if (!phone) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setError(null);
      const { data } = await getChats(phone);
      setChats(data.chats || []);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch chats.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [phone]);

  useEffect(() => {
    fetchChatList();
  }, [fetchChatList]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.event === 'new_message') {
      const newMessage = lastMessage.data;
      const chatId = newMessage.from;

      setChats(prevChats => {
        const existingChatIndex = prevChats.findIndex(chat => chat.id === chatId);
        let updatedChats = [...prevChats];

        if (existingChatIndex !== -1) {
          // Move existing chat to top
          const existingChat = { ...updatedChats[existingChatIndex] };
          existingChat.lastMessage = newMessage.content; // Assuming we add this field
          existingChat.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          updatedChats.splice(existingChatIndex, 1);
          updatedChats.unshift(existingChat);
          return updatedChats;
        } else {
          // If chat is new, refetch the whole list to get its name, etc.
          fetchChatList();
          return prevChats; // Return old state until fetch completes
        }
      });
    }
  }, [messages, fetchChatList]);

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('ChatView', { chatId: item.id, chatName: item.name, phone })}>
        <View style={[styles.chatItem, { borderBottomColor: theme.colors.border }]}>
        <View style={styles.chatContent}>
            <Text style={[styles.chatName, { color: theme.colors.text }]}>{item.name}</Text>
            <Text style={[styles.chatMessage, { color: theme.colors.text }]} numberOfLines={1}>
            {item.lastMessage || `Unread: ${item.unread}`}
            </Text>
        </View>
        <Text style={[styles.chatTime, { color: theme.colors.text }]}>{item.time || ''}</Text>
        </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: 'red', marginBottom: 20 }}>{error}</Text>
        <Button title="Retry" onPress={fetchChatList} color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={chats}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={[styles.emptyText, {color: theme.colors.text}]}>No chats found.</Text>}
      />
    </View>
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
  chatItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
  },
  chatContent: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatMessage: {
    fontSize: 14,
    marginTop: 2,
  },
  chatTime: {
    fontSize: 12,
  },
  emptyText: {
      textAlign: 'center',
      marginTop: 50,
      fontSize: 16,
  }
});