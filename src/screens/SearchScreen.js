import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { callAPI, API_ENDPOINTS } from '../services/api';

export default function SearchScreen({ navigation }) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterResults();
  }, [searchQuery, chats, contacts, messages]);

  const loadData = async () => {
    try {
      if (user?.phone) {
        const chatsRes = await callAPI(API_ENDPOINTS.GET_CHATS(user.phone));
        const contactsRes = await callAPI(API_ENDPOINTS.GET_CONTACTS(user.phone));
        
        setChats(chatsRes.chats || []);
        setContacts(contactsRes.contacts || []);
        
        const allMessages = [];
        for (const chat of (chatsRes.chats || [])) {
          try {
            const msgRes = await callAPI(API_ENDPOINTS.GET_MESSAGES(user.phone, chat.id, 20));
            if (msgRes.data?.messages) {
              msgRes.data.messages.forEach(msg => {
                allMessages.push({ ...msg, chatId: chat.id, chatName: chat.name });
              });
            }
          } catch (err) {
            console.log('Error loading messages for', chat.id);
          }
        }
        setMessages(allMessages);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const filterResults = () => {
    if (!searchQuery.trim()) {
      setFilteredResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = [];

    chats.forEach(chat => {
      if (chat.name?.toLowerCase().includes(query) || chat.lastMessage?.toLowerCase().includes(query)) {
        results.push({ type: 'chat', data: chat });
      }
    });

    contacts.forEach(contact => {
      if (contact.name?.toLowerCase().includes(query) || contact.number?.includes(query)) {
        results.push({ type: 'contact', data: contact });
      }
    });

    messages.forEach(message => {
      if (message.text?.toLowerCase().includes(query)) {
        results.push({ type: 'message', data: message });
      }
    });

    setFilteredResults(results);
  };

  const renderResult = ({ item }) => {
    const { type, data } = item;

    return (
      <TouchableOpacity
        style={[styles.resultItem, { borderBottomColor: colors.divider }]}
        onPress={() => {
          if (type === 'chat') {
            navigation.navigate('ChatView', { chat: data });
          } else if (type === 'message') {
            const chat = chats.find(c => c.id === data.chatId);
            navigation.navigate('ChatView', { 
              chat: chat || { id: data.chatId, name: data.chatName } 
            });
          } else {
            navigation.navigate('ChatView', { 
              chat: { id: data.id, name: data.name, profilePicUrl: data.profilePicUrl } 
            });
          }
        }}
      >
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          {data.profilePicUrl ? (
            <Image source={{ uri: data.profilePicUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>
              {(data.name || data.chatName)?.charAt(0).toUpperCase() || '?'}
            </Text>
          )}
        </View>
        <View style={styles.resultContent}>
          <Text style={[styles.resultName, { color: colors.text }]}>
            {type === 'message' ? data.chatName : data.name}
          </Text>
          {type === 'chat' && data.lastMessage && (
            <Text style={[styles.resultMessage, { color: colors.secondaryText }]} numberOfLines={1}>
              {data.lastMessage}
            </Text>
          )}
          {type === 'message' && (
            <Text style={[styles.resultMessage, { color: colors.secondaryText }]} numberOfLines={1}>
              {data.text}
            </Text>
          )}
          {type === 'contact' && (
            <Text style={[styles.resultMessage, { color: colors.secondaryText }]}>
              {data.about || 'Contact'}
            </Text>
          )}
        </View>
        <Ionicons 
          name={type === 'chat' ? 'chatbubble-outline' : type === 'message' ? 'text-outline' : 'person-outline'} 
          size={20} 
          color={colors.secondaryText} 
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.header }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.headerText} />
        </TouchableOpacity>
        <View style={[styles.searchContainer, { backgroundColor: colors.secondaryBackground }]}>
          <Ionicons name="search" size={20} color={colors.secondaryText} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search..."
            placeholderTextColor={colors.secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.secondaryText} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredResults}
        renderItem={renderResult}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        ListEmptyComponent={
          searchQuery.trim() ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color={colors.secondaryText} />
              <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                No results found
              </Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color={colors.secondaryText} />
              <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                Search for chats, contacts, and messages
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingTop: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
  },
  resultContent: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  resultMessage: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});
