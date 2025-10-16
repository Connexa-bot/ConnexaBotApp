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
import API, { callAPI } from '../services/api';
import { storage } from '../utils/storage';
import StatusRing from '../components/StatusRing';

export default function ChatsScreen() {
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const navigation = useNavigation();
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const handleCameraPress = () => {
    navigation.navigate('Camera');
  };

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredChats(chats);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = chats.filter(chat =>
        chat.name?.toLowerCase().includes(query) ||
        chat.lastMessage?.toLowerCase().includes(query)
      );
      setFilteredChats(filtered);
    }
  }, [searchQuery, chats]);

  const loadChats = async () => {
    try {
      if (user?.phone) {
        // Load from cache first for instant display
        const cachedChats = await storage.getCachedData(`chats_${user.phone}`);
        if (cachedChats && cachedChats.length > 0) {
          console.log('📱 Using cached chats:', cachedChats.length);
          setChats(cachedChats);
          setFilteredChats(cachedChats);
        }

        // Fetch from server
        const response = await callAPI(API.Chat.getAll(user.phone));
        console.log('📊 Chats API response:', response);

        // Extract chats array - backend returns {success: true, chats: [...], count: X}
        let chatsList = [];
        
        if (response?.success === true && Array.isArray(response.chats)) {
          chatsList = response.chats;
          console.log('✅ Successfully extracted', chatsList.length, 'chats from response');
        } else if (Array.isArray(response)) {
          chatsList = response;
        } else if (response?.chats && Array.isArray(response.chats)) {
          chatsList = response.chats;
        } else if (response?.data && Array.isArray(response.data)) {
          chatsList = response.data;
        } else {
          console.warn('⚠️ Unexpected response format:', typeof response);
        }
        
        // Update state with fetched data
        if (chatsList.length > 0) {
          setChats(chatsList);
          setFilteredChats(chatsList);
          await storage.setCachedData(`chats_${user.phone}`, chatsList);
          console.log('💾 Cached', chatsList.length, 'chats');
        } else {
          console.warn('⚠️ No chats in response - keeping cached data if available');
        }
      }
    } catch (error) {
      console.error('❌ Error loading chats:', error.message || error);
      // Keep using cached data on error
      const cachedChats = await storage.getCachedData(`chats_${user.phone}`);
      if (cachedChats && chats.length === 0) {
        setChats(cachedChats);
        setFilteredChats(cachedChats);
      }
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
    const hasStatus = item.hasStatus || false;
    const isStatusViewed = item.isStatusViewed || false;

    return (
      <TouchableOpacity
        style={[styles.chatItem, { backgroundColor: colors.background }]}
        onPress={() => navigation.navigate('ChatView', { chat: item })}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <StatusRing 
            size={56} 
            strokeWidth={2.5} 
            hasStatus={hasStatus}
            isViewed={isStatusViewed}
            progress={1}
          >
            {item.profilePicUrl ? (
              <Image source={{ uri: item.profilePicUrl }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>
                  {item.name?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
            )}
          </StatusRing>
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
                {item.lastMessage ? (typeof item.lastMessage === 'object' ? (item.lastMessage.text || 'Tap to chat') : item.lastMessage) : 'Tap to chat'}
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

  const searchFilters = [
    { id: 'Unread', label: 'Unread', icon: 'mail-unread-outline' },
    { id: 'Photos', label: 'Photos', icon: 'image-outline' },
    { id: 'Videos', label: 'Videos', icon: 'videocam-outline' },
    { id: 'Links', label: 'Links', icon: 'link-outline' },
  ];

  const filters = [
    { id: 'All', label: 'All' },
    { id: 'Unread', label: 'Unread', count: Array.isArray(filteredChats) ? filteredChats.filter(c => c.unreadCount > 0).length : 0 },
    { id: 'Favorites', label: 'Favorites' },
    { id: 'Groups', label: 'Groups' },
  ];

  const menuOptions = [
    { id: 'new_group', label: 'New group' },
    { id: 'new_broadcast', label: 'New broadcast' },
    { id: 'starred', label: 'Starred messages' },
    { id: 'settings', label: 'Settings' },
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
            } else if (option.id === 'starred') {
              navigation.navigate('StarredMessages');
            } else if (option.id === 'new_group') {
              navigation.navigate('GroupCreate');
            } else if (option.id === 'new_broadcast') {
              navigation.navigate('BroadcastCreate');
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
    } else if (optionId === 'starred') {
      navigation.navigate('StarredMessages');
    } else if (optionId === 'new_group') {
      navigation.navigate('GroupCreate');
    } else if (optionId === 'new_broadcast') {
      navigation.navigate('BroadcastCreate');
    }
  };

  const aiSuggestions = [
    { emoji: '😂', text: 'I want to hear a joke' },
    { emoji: '🎁', text: 'Help me with gift ideas' },
    { emoji: '🔍', text: 'I want to find info about a topic' },
    { emoji: '🎨', text: 'I want creative ideas' },
    { emoji: '📺', text: 'I want a new show to watch' },
    { emoji: '📚', text: 'I want to answer questions' },
  ];

  // Mock contacts for empty state (replace with actual contacts if available)
  const mockContacts = [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        backgroundColor={colors.header}
        barStyle={isDark ? 'light-content' : 'dark-content'}
        translucent={false}
      />

      {/* Custom Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBackground, paddingTop: insets.top }]}>
        <Text style={[styles.headerTitle, { color: '#00A884' }]}>WhatsApp</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleCameraPress} style={styles.headerIcon}>
            <Ionicons name="camera-outline" size={24} color={colors.headerIconColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleMenuPress} style={styles.headerIcon}>
            <Ionicons name="ellipsis-vertical" size={24} color={colors.headerIconColor} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Menu Dropdown */}
      {menuVisible && (
        <>
          <TouchableOpacity
            style={styles.menuOverlay}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          />
          <View style={[styles.menuDropdown, { backgroundColor: colors.menuBackground, top: insets.top + 50 }]}>
            {menuOptions.map((option, index) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.menuItem, 
                  { borderBottomColor: colors.menuDivider },
                  index === menuOptions.length - 1 && { borderBottomWidth: 0 }
                ]}
                onPress={() => handleMenuOptionPress(option.id)}
              >
                <Text style={[styles.menuItemText, { color: colors.menuText }]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Expanded Search Header - Shows when search is focused */}
      {isSearchExpanded ? (
        <View style={[styles.expandedSearchHeader, { backgroundColor: colors.background, paddingTop: insets.top }]}>
          <View style={[styles.expandedSearchBar, { backgroundColor: colors.background }]}>
            <TouchableOpacity onPress={() => {
              setIsSearchExpanded(false);
              setIsSearchFocused(false);
              setSearchQuery('');
            }}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <TextInput
              style={[styles.expandedSearchInput, { color: colors.text }]}
              placeholder="Ask Connexa AI or Search"
              placeholderTextColor={colors.tertiaryText}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.tertiaryText} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={{ marginLeft: 16 }}>
              <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* AI Suggestions when no query */}
          {!searchQuery.trim() && (
            <View style={styles.aiSuggestionsContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.aiSuggestionsContent}
              >
                {aiSuggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.aiSuggestionChip, { backgroundColor: colors.secondaryBackground }]}
                    onPress={() => setSearchQuery(suggestion.text)}
                  >
                    <Text style={styles.aiSuggestionEmoji}>{suggestion.emoji}</Text>
                    <Text style={[styles.aiSuggestionText, { color: colors.text }]} numberOfLines={1}>
                      {suggestion.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Search Filter Chips */}
          {!searchQuery.trim() && (
            <View style={styles.filtersContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersContent}
              >
                {searchFilters.map((filter) => (
                  <TouchableOpacity
                    key={filter.id}
                    style={[styles.filterChip, { backgroundColor: colors.secondaryBackground }]}
                  >
                    <Ionicons name={filter.icon} size={18} color={colors.text} style={{ marginRight: 6 }} />
                    <Text style={[styles.filterText, { color: colors.text }]}>{filter.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      ) : (
        /* Normal Meta AI Search Bar */
        <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={[styles.metaAISearchBar, { backgroundColor: colors.secondaryBackground }]}
            onPress={() => {
              setIsSearchExpanded(true);
              setIsSearchFocused(true);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="search" size={20} color={colors.tertiaryText} style={styles.searchIcon} />
            <Text style={[styles.metaAIPlaceholder, { color: colors.tertiaryText }]}>
              Ask Connexa AI or Search
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filter Chips - Only show when search is not expanded */}
      {!isSearchExpanded && (
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
                <Ionicons
                  name={
                    filter.id === 'Unread' ? 'mail-unread-outline' :
                    filter.id === 'Favorites' ? 'star-outline' :
                    filter.id === 'Groups' ? 'people-outline' :
                    filter.id === 'All' ? 'apps-outline' : 'apps-outline'
                  }
                  size={18}
                  color={selectedFilter === filter.id ? colors.primary : colors.text}
                  style={{ marginRight: 6 }}
                />
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
          </ScrollView>
        </View>
      )}

      {/* Archived Section - Show when not typing */}
      {!searchQuery.trim() && (
        <TouchableOpacity style={[styles.archivedSection, { backgroundColor: colors.background }]}>
          <Ionicons name="archive-outline" size={24} color={colors.tertiaryText} />
          <Text style={[styles.archivedText, { color: colors.text }]}>Archived</Text>
        </TouchableOpacity>
      )}

      {/* Search Results when typing */}
      {isSearchExpanded && searchQuery.trim() ? (
        <ScrollView style={{ flex: 1 }}>
          {/* Chats Section */}
          {filteredChats.length > 0 && (
            <View>
              <Text style={[styles.searchSectionTitle, { color: colors.secondaryText }]}>Chats</Text>
              {filteredChats.slice(0, 3).map((chat) => renderChat({ item: chat }))}
            </View>
          )}

          {/* Other Contacts Section */}
          <View>
            <Text style={[styles.searchSectionTitle, { color: colors.secondaryText }]}>Other contacts</Text>
            <TouchableOpacity style={[styles.chatItem, { backgroundColor: colors.background }]}>
              <View style={styles.avatarContainer}>
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                  <Text style={styles.avatarText}>Y</Text>
                </View>
              </View>
              <View style={styles.chatContent}>
                <Text style={[styles.chatName, { color: colors.text }]}>Yellow</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Ask Meta AI Section */}
          <View>
            <Text style={[styles.searchSectionTitle, { color: colors.secondaryText }]}>Ask Connexa AI</Text>
            <TouchableOpacity style={[styles.chatItem, { backgroundColor: colors.background }]}>
              <Ionicons name="search-circle-outline" size={40} color={colors.primary} style={{ marginRight: 12 }} />
              <Text style={[styles.chatMessage, { color: colors.text }]}>{searchQuery}</Text>
            </TouchableOpacity>
          </View>

          {/* Messages Section */}
          <View>
            <Text style={[styles.searchSectionTitle, { color: colors.secondaryText }]}>Messages</Text>
            {filteredChats.slice(0, 2).map((chat) => (
              <TouchableOpacity key={chat.id} style={[styles.chatItem, { backgroundColor: colors.background }]}>
                <View style={styles.avatarContainer}>
                  {chat.profilePicUrl ? (
                    <Image source={{ uri: chat.profilePicUrl }} style={styles.avatarImage} />
                  ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                      <Text style={styles.avatarText}>{chat.name?.charAt(0).toUpperCase() || '?'}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.chatContent}>
                  <Text style={[styles.chatName, { color: colors.text }]}>{chat.name || chat.id}</Text>
                  <Text style={[styles.chatMessage, { color: colors.tertiaryText }]} numberOfLines={1}>
                    {chat.lastMessage || 'Tap to chat'}
                  </Text>
                </View>
                <Text style={[styles.chatTime, { color: colors.tertiaryText }]}>
                  {formatTime(chat.lastMessageTime)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : filteredChats.length === 0 ? (
        /* Empty State - Non-scrollable with contacts row */
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyContent}>
            <Ionicons name="chatbubbles" size={64} color={colors.tertiaryText} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No chats yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.secondaryText }]}>
              {user?.phone ? 
                'Your WhatsApp chats will appear here once they sync from the backend' :
                'Please connect your WhatsApp to see your chats'
              }
            </Text>
            {user?.phone && (
              <TouchableOpacity 
                style={[styles.refreshButton, { backgroundColor: colors.primary }]}
                onPress={onRefresh}
              >
                <Ionicons name="refresh" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Contacts Row - Only shown when there are contacts */}
          {mockContacts.length > 0 && (
            <View style={styles.contactsRow}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.contactsContent}
              >
                {mockContacts.map((contact, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.contactItem}
                    onPress={() => navigation.navigate('ChatView', { chat: contact })}
                  >
                    <View style={[styles.contactAvatar, { backgroundColor: colors.primary }]}>
                      <Text style={styles.contactAvatarText}>
                        {contact.name?.charAt(0).toUpperCase() || '?'}
                      </Text>
                    </View>
                    <Text style={[styles.contactName, { color: colors.text }]} numberOfLines={1}>
                      {contact.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      ) : (
        /* Chat List */
        <FlatList
          data={filteredChats}
          renderItem={renderChat}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={{
            paddingBottom: Platform.OS === 'ios' ? 100 : 85,
            flexGrow: 1,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}

      {/* Floating Action Button - Hide when search is expanded */}
      {!isSearchExpanded && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('Contacts')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    elevation: 0,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  headerIcon: {
    padding: 4,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 998,
  },
  menuDropdown: {
    position: 'absolute',
    right: 8,
    minWidth: 180,
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    zIndex: 999,
    overflow: 'hidden',
    paddingVertical: 4,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 0,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '400',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  metaAISearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  metaAIInput: {
    fontSize: 16,
    flex: 1,
    padding: 0,
  },
  metaAIPlaceholder: {
    fontSize: 16,
    flex: 1,
  },
  expandedSearchHeader: {
    paddingBottom: 8,
  },
  expandedSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  expandedSearchInput: {
    fontSize: 16,
    flex: 1,
    padding: 0,
  },
  searchSectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
  },
  aiSuggestionsContainer: {
    paddingVertical: 8,
  },
  aiSuggestionsContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  aiSuggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    maxWidth: 240,
  },
  aiSuggestionEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  aiSuggestionText: {
    fontSize: 14,
  },
  filtersContainer: {
    paddingVertical: 6,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
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
    borderBottomWidth: 0.2,
    borderBottomColor: '#DADADA',
  },
  archivedText: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '500',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  contactsRow: {
    paddingVertical: 20,
    borderTopWidth: 0.5,
    borderTopColor: '#E5E5EA',
  },
  contactsContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  contactItem: {
    alignItems: 'center',
    width: 70,
  },
  contactAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  contactAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '500',
  },
  contactName: {
    fontSize: 13,
    textAlign: 'center',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 20,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  chatItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.2,
    borderBottomColor: '#DADADA',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
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
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 85,
    right: 16,
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
    zIndex: 100,
  },
});