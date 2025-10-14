import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  TextInput,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { callAPI, API_ENDPOINTS } from '../services/api';

export default function ChatsScreen() {
  const [chats, setChats] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation();
  const { user } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

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

  const filters = [
    { id: 'All', label: 'All' },
    { id: 'Unread', label: 'Unread', count: Array.isArray(chats) ? chats.filter(c => c.unreadCount > 0).length : 0 },
    { id: 'Favorites', label: 'Favorites' },
    { id: 'Groups', label: 'Groups' },
  ];

  const menuOptions = [
    { id: 'new_group', label: 'New group', icon: 'people-outline' },
    { id: 'new_broadcast', label: 'New broadcast', icon: 'megaphone-outline' },
    { id: 'linked_devices', label: 'Linked devices', icon: 'laptop-outline' },
    { id: 'starred', label: 'Starred', icon: 'star-outline' },
    { id: 'settings', label: 'Settings', icon: 'settings-outline' },
  ];

  const handleMenuPress = () => {
    if (Platform.OS === 'ios') {
      const { ActionSheetIOS } = require('react-native');
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...menuOptions.map(o => o.label), 'Cancel'],
          cancelButtonIndex: menuOptions.length,
        },
        (buttonIndex) => {
          if (buttonIndex < menuOptions.length) {
            const option = menuOptions[buttonIndex];
            if (option.id === 'settings') {
              navigation.navigate('Settings');
            }
          }
        }
      );
    } else {
      setMenuVisible(!menuVisible);
    }
  };

  const handleMenuOptionPress = (optionId) => {
    setMenuVisible(false);
    if (optionId === 'settings') {
      navigation.navigate('Settings');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        backgroundColor={colors.background} 
        barStyle={colors.isDark ? 'light-content' : 'dark-content'}
        translucent={false}
      />

      {/* Menu Dropdown (Android) */}
      {menuVisible && Platform.OS === 'android' && (
        <>
          <TouchableOpacity 
            style={styles.menuOverlay} 
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          />
          <View style={[styles.menuDropdown, { backgroundColor: colors.secondaryBackground }]}>
            {menuOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.menuItem}
                onPress={() => handleMenuOptionPress(option.id)}
              >
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
        <TouchableOpacity 
          style={[styles.searchBar, { backgroundColor: colors.secondaryBackground }]}
          onPress={() => navigation.navigate('Search')}
          activeOpacity={0.7}
        >
          <Ionicons name="search" size={20} color={colors.tertiaryText} style={styles.searchIcon} />
          <Text style={[styles.searchPlaceholder, { color: colors.tertiaryText }]}>
            Ask Connexa
          </Text>
          <View style={styles.aiIconContainer}>
            <Ionicons name="sparkles" size={18} color={colors.primary} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <View style={styles.filtersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                selectedFilter === filter.id && { backgroundColor: colors.primary + '20' },
                selectedFilter !== filter.id && { backgroundColor: colors.secondaryBackground },
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter.id && { color: colors.primary },
                  selectedFilter !== filter.id && { color: colors.text },
                ]}
              >
                {filter.label}
                {filter.count > 0 && ` ${filter.count}`}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.filterChip, { backgroundColor: colors.secondaryBackground }]}>
            <Ionicons name="add" size={20} color={colors.text} />
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Archived Section */}
      <TouchableOpacity style={[styles.archivedSection, { backgroundColor: colors.background }]}>
        <Ionicons name="archive-outline" size={24} color={colors.tertiaryText} />
        <Text style={[styles.archivedText, { color: colors.text }]}>Archived</Text>
      </TouchableOpacity>

      {/* Chat List */}
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
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  menuDropdown: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 56 : 100,
    right: 16,
    width: 200,
    borderRadius: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 1000,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemText: {
    fontSize: 16,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
  },
  aiIconContainer: {
    marginLeft: 8,
  },
  filtersContainer: {
    paddingVertical: 8,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  archivedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 28,
  },
  archivedText: {
    fontSize: 16,
    fontWeight: '500',
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
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
