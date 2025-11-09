
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import MessageBubble from '../components/MessageBubble';
import API, { callAPI } from '../services/api';

export default function StarredMessagesScreen() {
  const [starredMessages, setStarredMessages] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { user } = useAuth();
  const { colors } = useTheme();

  useEffect(() => {
    loadStarredMessages();
  }, []);

  const loadStarredMessages = async () => {
    try {
      if (user?.phone) {
        const response = await callAPI(API.Message.getStarred(user.phone));
        setStarredMessages(response.messages || []);
      }
    } catch (error) {
      console.error('Error loading starred messages:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleMessagePress = (message) => {
    navigation.navigate('ChatView', {
      chat: { id: message.chatId, name: message.chatName }
    });
  };

  const renderMessage = ({ item }) => (
    <TouchableOpacity onPress={() => handleMessagePress(item)}>
      <View style={[styles.messageContainer, { borderBottomColor: colors.border }]}>
        <Text style={[styles.chatName, { color: colors.secondaryText }]}>
          {item.chatName}
        </Text>
        <MessageBubble message={item} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.header }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Starred Messages</Text>
      </View>

      <FlatList
        data={starredMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadStarredMessages} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="star-outline" size={64} color={colors.secondaryText} />
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
              No starred messages
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 16,
  },
  messageContainer: {
    padding: 8,
    borderBottomWidth: 0.5,
  },
  chatName: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 12,
    marginBottom: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
});
