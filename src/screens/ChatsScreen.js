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
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import API, { callAPI } from '../services/api';
import { storage } from '../utils/storage';
import StatusRing from '../components/StatusRing';
import ProfileCard from '../components/ProfileCard';

export default function ChatsScreen() {
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
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
      applyFilter(selectedFilter);
    } else {
      handleSearch(searchQuery);
    }
  }, [searchQuery, chats, selectedFilter]);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      applyFilter(selectedFilter);
      return;
    }

    try {
      // Search via API
      const response = await callAPI(API.Message.search(user.phone, query));

      if (response?.results) {
        // Filter by selected filter type
        let filtered = response.results;

        switch (selectedFilter) {
          case 'Unread':
            filtered = filtered.filter(chat => chat.unreadCount > 0);
            break;
          case 'Favorites':
            filtered = filtered.filter(chat => chat.isPinned);
            break;
          case 'Groups':
            filtered = filtered.filter(chat => chat.isGroup);
            break;
        }

        setFilteredChats(filtered);
      } else {
        // Fallback to local search
        const localFiltered = chats.filter(chat =>
          chat.name?.toLowerCase().includes(query.toLowerCase()) ||
          chat.lastMessage?.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredChats(localFiltered);
      }
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to local search
      const localFiltered = chats.filter(chat =>
        chat.name?.toLowerCase().includes(query.toLowerCase()) ||
        chat.lastMessage?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredChats(localFiltered);
    }
  };

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

    // Handle both unix timestamp (seconds) and milliseconds
    const date = new Date(timestamp > 10000000000 ? timestamp : timestamp * 1000);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time to midnight for date comparison
    const todayMidnight = new Date(today.setHours(0, 0, 0, 0));
    const yesterdayMidnight = new Date(yesterday.setHours(0, 0, 0, 0));
    const dateMidnight = new Date(date.setHours(0, 0, 0, 0));

    if (dateMidnight.getTime() === todayMidnight.getTime()) {
      // Today - show time
      return new Date(timestamp > 10000000000 ? timestamp : timestamp * 1000).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
    } else if (dateMidnight.getTime() === yesterdayMidnight.getTime()) {
      // Yesterday
      return 'Yesterday';
    } else if (new Date() - dateMidnight < 7 * 24 * 60 * 60 * 1000) {
      // Last 7 days - show day name
      return new Date(timestamp > 10000000000 ? timestamp : timestamp * 1000).toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      // Older - show date
      return new Date(timestamp > 10000000000 ? timestamp : timestamp * 1000).toLocaleDateString('en-US', { 
        month: 'numeric', 
        day: 'numeric', 
        year: '2-digit' 
      });
    }
  };

  const handleAvatarPress = (item) => {
    if (item.hasStatus && !item.isStatusViewed) {
      // If has unviewed status, go directly to status view
      navigation.navigate('StatusView', { contact: item });
    } else if (item.hasStatus && item.isStatusViewed) {
      // If has viewed status, show options
      setSelectedContact(item);
      setShowProfileCard(true);
    } else {
      // No status, show profile card directly
      setSelectedContact(item);
      setShowProfileCard(true);
    }
  };

  const renderChat = ({ item }) => {
    const isPinned = item.isPinned || false;
    const isMuted = item.isMuted || false;
    const hasStatus = item.hasStatus || false;
    const isStatusViewed = item.isStatusViewed || false;

    // Extract text and time for display
    let lastMessageText = 'Tap to chat';
    let lastMessageTime = item.lastMessageTime;

    if (item.lastMessage) {
      if (typeof item.lastMessage === 'object' && item.lastMessage.text) {
        lastMessageText = item.lastMessage.text;
      } else if (typeof item.lastMessage === 'string') {
        lastMessageText = item.lastMessage;
      }
    }
    
    return (
      <TouchableOpacity
        style={[styles.chatItem, { backgroundColor: colors.background }]}
        onPress={() => navigation.navigate('ChatView', { chat: item })}
        activeOpacity={0.7}
      >
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={() => handleAvatarPress(item)}
          activeOpacity={0.8}
        >
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
        </TouchableOpacity>

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
              {formatTime(lastMessageTime)}
            </Text>
          </View>

          <View style={styles.bottomRow}>
            <View style={styles.messageContainer}>
              {item.lastMessageFromMe && (
                <View style={styles.tickContainer}>
                  {item.lastMessageStatus === 'pending' && (
                    <Ionicons name="time-outline" size={16} color={colors.tertiaryText} style={styles.statusIcon} />
                  )}
                  {item.lastMessageStatus === 'sent' && (
                    <Ionicons name="checkmark" size={16} color={colors.tertiaryText} style={styles.statusIcon} />
                  )}
                  {item.lastMessageStatus === 'delivered' && (
                    <Ionicons name="checkmark-done" size={16} color={colors.tertiaryText} style={styles.statusIcon} />
                  )}
                  {item.lastMessageStatus === 'read' && (
                    <Ionicons name="checkmark-done" size={16} color="#53BDEB" style={styles.statusIcon} />
                  )}
                </View>
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
                {lastMessageText}
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
    { id: 'Photos', label: 'Photos', icon: 'image-outline' },
    { id: 'Videos', label: 'Videos', icon: 'videocam-outline' },
    { id: 'Audio', label: 'Audio', icon: 'musical-notes-outline' },
    { id: 'Documents', label: 'Documents', icon: 'document-outline' },
    { id: 'Links', label: 'Links', icon: 'link-outline' },
  ];

  const [customFilters, setCustomFilters] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [archivedChats, setArchivedChats] = useState([]);

  const filters = [
    { id: 'All', label: 'All', icon: 'apps' },
    { id: 'Unread', label: 'Unread', count: Array.isArray(chats) ? chats.filter(c => c.unreadCount > 0).length : 0, icon: 'mail-unread' },
    { id: 'Favorites', label: 'Favorites', icon: 'star' },
    { id: 'Groups', label: 'Groups', icon: 'people' },
    ...customFilters.map(f => ({ id: f.id, label: f.name, icon: 'list', custom: true }))
  ];

  const applyFilter = (filterId) => {
    let filtered = [...chats];

    switch (filterId) {
      case 'All':
        filtered = chats;
        break;
      case 'Unread':
        filtered = chats.filter(chat => chat.unreadCount > 0);
        break;
      case 'Favorites':
        filtered = chats.filter(chat => chat.isPinned);
        break;
      case 'Groups':
        filtered = chats.filter(chat => chat.isGroup);
        break;
      default:
        // Custom filter
        const customFilter = customFilters.find(f => f.id === filterId);
        if (customFilter && customFilter.chatIds) {
          filtered = chats.filter(chat => customFilter.chatIds.includes(chat.id));
        }
    }

    setFilteredChats(filtered);
  };

  const loadArchivedChats = async () => {
    try {
      const response = await callAPI(API.Chat.getArchived(user.phone));
      if (response?.chats) {
        setArchivedChats(response.chats);
      }
    } catch (error) {
      console.error('Error loading archived chats:', error);
    }
  };

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
        <Text style={[styles.headerTitle, { color: colors.headerText }]}>WhatsApp</Text>
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

          {/* AI Suggestions and Search Filters - Only show when "All" filter is active */}
          {!searchQuery.trim() && selectedFilter === 'All' && (
            <>
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
            </>
          )}

          {/* Filter-specific search placeholder */}
          {!searchQuery.trim() && selectedFilter !== 'All' && (
            <View style={[styles.filterSearchHint, { backgroundColor: colors.background, padding: 16 }]}>
              <Text style={[styles.filterSearchHintText, { color: colors.secondaryText }]}>
                Search in {selectedFilter.toLowerCase()} chats
              </Text>
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
                  selectedFilter === filter.id && styles.filterChipActive,
                  selectedFilter !== filter.id && { 
                    backgroundColor: isDark ? '#233138' : '#E9EDEF',
                    borderWidth: 0,
                  },
                ]}
                onPress={() => {
                  setSelectedFilter(filter.id);
                  applyFilter(filter.id);
                }}
              >
                <Ionicons
                  name={filter.icon}
                  size={16}
                  color={selectedFilter === filter.id ? colors.primary : colors.text}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.filterText,
                    { color: selectedFilter === filter.id ? colors.primary : colors.text },
                  ]}
                >
                  {filter.label}
                  {filter.count > 0 && ` ${filter.count}`}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={[styles.addFilterButton, { backgroundColor: isDark ? '#233138' : '#E9EDEF' }]}
              onPress={() => setShowFilterModal(true)}
            >
              <Ionicons name="add" size={20} color={colors.text} />
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Archived Section - Show when not typing */}
      {!searchQuery.trim() && selectedFilter === 'All' && (
        <TouchableOpacity 
          style={[styles.archivedSection, { 
            backgroundColor: colors.background,
            borderBottomWidth: 0.5,
            borderBottomColor: isDark ? '#1F2C34' : '#E9EDEF'
          }]}
          onPress={() => {
            loadArchivedChats();
            navigation.navigate('ArchivedChats', { archivedChats });
          }}
        >
          <View style={[styles.archivedIconBox, { backgroundColor: isDark ? '#233138' : '#E9EDEF' }]}>
            <Ionicons name="archive-outline" size={20} color={colors.text} />
          </View>
          <Text style={[styles.archivedText, { color: colors.text }]}>Archived</Text>
          {archivedChats.length > 0 && (
            <Text style={[styles.archivedCount, { color: colors.tertiaryText }]}>
              {archivedChats.length}
            </Text>
          )}
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
        /* Filter-specific Empty States */
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyContent}>
            {selectedFilter === 'All' ? (
              <>
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
              </>
            ) : selectedFilter === 'Unread' ? (
              <>
                <Ionicons name="mail-unread-outline" size={64} color={colors.tertiaryText} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  No unread chats
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.secondaryText }]}>
                  You're all caught up! All your chats have been read.
                </Text>
              </>
            ) : selectedFilter === 'Favorites' ? (
              <>
                <Ionicons name="star-outline" size={64} color={colors.tertiaryText} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  No favorites
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.secondaryText }]}>
                  Pin your important chats to keep them at the top
                </Text>
              </>
            ) : selectedFilter === 'Groups' ? (
              <>
                <Ionicons name="people-outline" size={64} color={colors.tertiaryText} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  No groups
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.secondaryText }]}>
                  Create or join a group to get started
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="list-outline" size={64} color={colors.tertiaryText} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  No chats in this list
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.secondaryText }]}>
                  Add chats to your custom list
                </Text>
              </>
            )}
          </View>

          {/* Contacts Row - Only shown when there are contacts and All filter is active */}
          {mockContacts.length > 0 && selectedFilter === 'All' && (
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

      {/* Profile Card Modal */}
      {showProfileCard && selectedContact && (
        <ProfileCard
          visible={showProfileCard}
          contact={selectedContact}
          onClose={() => setShowProfileCard(false)}
          onMessage={() => {
            setShowProfileCard(false);
            navigation.navigate('ChatView', { chat: selectedContact });
          }}
          onCall={() => {
            setShowProfileCard(false);
            navigation.navigate('ChatView', { chat: selectedContact });
          }}
          onVideoCall={() => {
            setShowProfileCard(false);
            navigation.navigate('ChatView', { chat: selectedContact });
          }}
          onInfo={() => {
            setShowProfileCard(false);
            navigation.navigate('ContactProfile', { contact: selectedContact });
          }}
          onViewFullScreen={() => {
            // Fullscreen is handled within ProfileCard
          }}
        />
      )}

      {/* Custom Filter Creation Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.filterModalOverlay}>
          <View style={[styles.filterModalContent, { backgroundColor: colors.background }]}>
            <View style={styles.filterModalHeader}>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.filterModalTitle, { color: colors.text }]}>New list</Text>
              <View style={{ width: 24 }} />
            </View>

            <View style={styles.filterModalBody}>
              <Text style={[styles.filterModalLabel, { color: colors.secondaryText }]}>List name</Text>
              <TextInput
                style={[styles.filterModalInput, { 
                  color: colors.text,
                  borderColor: colors.primary,
                  backgroundColor: colors.background 
                }]}
                placeholder="Example: Work, Friends"
                placeholderTextColor={colors.tertiaryText}
                onChangeText={(text) => {
                  // Handle filter name input
                }}
              />
              <Text style={[styles.filterModalHint, { color: colors.tertiaryText }]}>
                Any list you create becomes a filter at the top of your Chats tab.
              </Text>

              <TouchableOpacity 
                style={[styles.filterModalButton, { backgroundColor: colors.secondaryBackground }]}
                onPress={() => {
                  // Navigate to contact/group selector
                  setShowFilterModal(false);
                  navigation.navigate('SelectChatsForFilter');
                }}
              >
                <Text style={[styles.filterModalButtonText, { color: colors.secondaryText }]}>
                  Add people or groups
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    letterSpacing: 0,
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
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  filtersContent: {
    gap: 6,
    alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
  },
  filterChipActive: {
    backgroundColor: '#D0F4EA',
    borderWidth: 0,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '400',
  },
  addFilterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  archivedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  archivedIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  archivedText: {
    fontSize: 15,
    fontWeight: '400',
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
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 20,
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
  tickContainer: {
    marginRight: 4,
  },
  archivedCount: {
    fontSize: 15,
    marginLeft: 'auto',
  },
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    minHeight: 400,
  },
  filterModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9EDEF',
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  filterModalBody: {
    padding: 20,
  },
  filterModalLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  filterModalInput: {
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  filterModalHint: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 24,
  },
  filterModalButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  filterModalButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  
  filterSearchHint: {
    paddingVertical: 8,
  },
  filterSearchHintText: {
    fontSize: 14,
    textAlign: 'center',
  },
});