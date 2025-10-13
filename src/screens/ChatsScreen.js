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

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderChat = ({ item }) => {
    const isPinned = item.isPinned || false;
    const isMuted = item.isMuted || false;

    return (
      <TouchableOpacity
        style={[styles.chatItem, { backgroundColor: colors.background, borderBottomColor: colors.divider }]}
        onPress={() => navigation.navigate('ChatView', { chat: item })}
        activeOpacity={0.8}
      >
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          {item.profilePicUrl ? (
            <Image source={{ uri: item.profilePicUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>
              {item.name?.charAt(0).toUpperCase() || '?'}
            </Text>
          )}
        </View>

        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <View style={styles.chatNameRow}>
              <Text style={[styles.chatName, { color: colors.text }]} numberOfLines={1}>
                {item.name || item.id}
              </Text>
              {isPinned && (
                <Ionicons name="pin" size={12} color={colors.tertiaryText} style={styles.pinIcon} />
              )}
            </View>
            <View style={styles.timeContainer}>
              <Text style={[styles.chatTime, { color: item.unreadCount > 0 ? colors.primary : colors.tertiaryText }]}>
                {formatTime(item.lastMessageTime)}
              </Text>
            </View>
          </View>

          <View style={styles.chatFooter}>
            <View style={styles.messageRow}>
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
            <View style={styles.badgesRow}>
              {isMuted && (
                <Ionicons name="volume-mute" size={16} color={colors.tertiaryText} style={styles.muteIcon} />
              )}
              {item.unreadCount > 0 && (
                <View style={[styles.unreadBadge, { backgroundColor: colors.unreadBadge }]}>
                  <Text style={[styles.unreadText, { color: colors.unreadBadgeText }]}>
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
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={80} color={colors.secondaryText} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Start a conversation
            </Text>
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
              Tap the new chat button to message someone
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      />
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('NewChat')}
        >
          <Ionicons name="chatbubble-ellipses-sharp" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '500',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  chatItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.2,
  },
  avatar: {
    width: 49,
    height: 49,
    borderRadius: 24.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarImage: {
    width: 49,
    height: 49,
    borderRadius: 24.5,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '400',
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 3,
  },
  chatNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chatName: {
    fontSize: 16.5,
    fontWeight: '400',
    lineHeight: 21,
  },
  pinIcon: {
    marginLeft: 4,
    marginTop: 2,
  },
  timeContainer: {
    marginLeft: 8,
  },
  chatTime: {
    fontSize: 12,
    lineHeight: 16,
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIcon: {
    marginRight: 4,
  },
  chatMessage: {
    fontSize: 14,
    lineHeight: 19,
    flex: 1,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  muteIcon: {
    marginRight: 6,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    alignItems: 'flex-end',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabSecondary: {
    marginBottom: 12,
  },
});