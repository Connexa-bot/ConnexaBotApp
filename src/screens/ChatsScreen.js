import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { callAPI, API_ENDPOINTS } from '../services/api';

export default function ChatsScreen() {
  const [chats, setChats] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { user } = useAuth();
  const { colors } = useTheme();

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      if (user?.phone) {
        const response = await callAPI(API_ENDPOINTS.GET_CHATS(user.phone));
        setChats(response.chats || []);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadChats();
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else if (today - date < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });
  };

  const renderChat = ({ item }) => {
    const isPinned = item.isPinned || false;
    const isMuted = item.isMuted || false;

    return (
      <TouchableOpacity
        style={[styles.chatItem, { backgroundColor: colors.background }]}
        onPress={() => navigation.navigate('ChatView', { chat: item })}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          {item.profilePicUrl ? (
            <Image source={{ uri: item.profilePicUrl }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {item.name?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.chatContent}>
          <View style={styles.topRow}>
            <View style={styles.nameContainer}>
              <Text style={[styles.chatName, { color: colors.text }]} numberOfLines={1}>
                {item.name || item.id}
              </Text>
              {isPinned && (
                <Ionicons name="pin" size={14} color={colors.tertiaryText} style={styles.pinIcon} />
              )}
            </View>
            <Text style={[styles.chatTime, { color: item.unreadCount > 0 ? colors.primary : colors.tertiaryText }]}>
              {formatTime(item.lastMessageTime)}
            </Text>
          </View>

          <View style={styles.bottomRow}>
            <View style={styles.messageContainer}>
              {item.lastMessageFromMe && (
                <Ionicons
                  name={item.lastMessageStatus === 'read' ? 'checkmark-done' : 'checkmark'}
                  size={16}
                  color={item.lastMessageStatus === 'read' ? '#53BDEB' : colors.tertiaryText}
                  style={styles.statusIcon}
                />
              )}
              <Text
                style={[
                  styles.chatMessage,
                  {
                    color: item.unreadCount > 0 ? colors.text : colors.tertiaryText,
                    fontWeight: item.unreadCount > 0 ? '500' : '400'
                  }
                ]}
                numberOfLines={1}
              >
                {item.lastMessage || 'Tap to chat'}
              </Text>
            </View>
            
            <View style={styles.badges}>
              {isMuted && (
                <Ionicons name="volume-mute" size={18} color={colors.tertiaryText} style={styles.muteIcon} />
              )}
              {item.unreadCount > 0 && (
                <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.unreadText}>
                    {item.unreadCount > 999 ? '999+' : item.unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={chats}
        renderItem={renderChat}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={chats.length === 0 ? styles.emptyListContainer : null}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="chatbubbles" size={64} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Start messaging
            </Text>
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
              Send messages to your contacts and start conversations
            </Text>
            <TouchableOpacity 
              style={[styles.emptyButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('Contacts')}
            >
              <Text style={styles.emptyButtonText}>Start a chat</Text>
            </TouchableOpacity>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('Contacts')}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubble-ellipses" size={26} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F2F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  emptyButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  chatItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '500',
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
    paddingBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  chatName: {
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 22,
  },
  pinIcon: {
    marginLeft: 6,
  },
  chatTime: {
    fontSize: 13,
    lineHeight: 18,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  statusIcon: {
    marginRight: 4,
  },
  chatMessage: {
    fontSize: 15,
    lineHeight: 20,
    flex: 1,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  muteIcon: {
    marginRight: 4,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
