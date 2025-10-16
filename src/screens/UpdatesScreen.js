
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  Platform,
  Alert,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import API, { callAPI } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function UpdatesScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const [statuses, setStatuses] = useState([]);
  const [channels, setChannels] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const nav = useNavigation();
  const insets = useSafeAreaInsets();

  const menuOptions = [
    { id: 'status_privacy', label: 'Status privacy' },
    { id: 'settings', label: 'Settings' },
  ];

  useEffect(() => {
    loadStatuses();
    loadChannels();
  }, []);

  const loadStatuses = async () => {
    try {
      if (user?.phone) {
        const response = await callAPI(API.Status.getAll(user.phone));
        console.log('📊 Status response:', JSON.stringify(response, null, 2));
        
        let statusList = [];
        if (Array.isArray(response)) {
          statusList = response;
        } else if (response.success && response.statusUpdates && Array.isArray(response.statusUpdates)) {
          statusList = response.statusUpdates;
        } else if (response.statusUpdates && Array.isArray(response.statusUpdates)) {
          statusList = response.statusUpdates;
        } else if (response.data && Array.isArray(response.data)) {
          statusList = response.data;
        }
        
        console.log('📊 Processed statuses count:', statusList.length);
        setStatuses(statusList);
      }
    } catch (error) {
      console.error('Error loading statuses:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const loadChannels = async () => {
    try {
      if (user?.phone) {
        const response = await callAPI(API.Channel.getAll(user.phone));
        console.log('📊 Channels response:', JSON.stringify(response, null, 2));
        
        let channelsList = [];
        if (Array.isArray(response)) {
          channelsList = response;
        } else if (response.success && response.data && Array.isArray(response.data)) {
          channelsList = response.data;
        } else if (response.channels && Array.isArray(response.channels)) {
          channelsList = response.channels;
        } else if (response.data && Array.isArray(response.data)) {
          channelsList = response.data;
        }
        
        console.log('📊 Processed channels count:', channelsList.length);
        setChannels(channelsList);
      }
    } catch (error) {
      console.error('Error loading channels:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStatuses();
    loadChannels();
  };

  const handleCameraPress = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to post status');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const mediaType = result.assets[0].type || 'image';
      navigation.navigate('StatusPost', {
        mediaUri: result.assets[0].uri,
        mediaType: mediaType,
      });
    }
  };

  const handleTextStatusPress = () => {
    navigation.navigate('StatusPost', {});
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const now = Date.now();
    const diff = now - (timestamp * 1000);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (hours < 1) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return 'Yesterday';
  };

  const viewStatus = async (status) => {
    try {
      await callAPI(API.Status.view(user.phone, status.jid, [status.key]));
    } catch (error) {
      console.error('Error viewing status:', error);
    }
  };

  const handleMenuPress = () => {
    setMenuVisible(!menuVisible);
  };

  const handleMenuOptionPress = (optionId) => {
    setMenuVisible(false);
    
    switch (optionId) {
      case 'status_privacy':
        // Navigate to status privacy settings
        break;
      case 'settings':
        nav.navigate('Settings');
        break;
    }
  };

  const EmptyChannelsView = () => (
    <View style={styles.emptyChannels}>
      <View style={[styles.emptyIconContainer, { backgroundColor: colors.secondaryBackground }]}>
        <Ionicons name="megaphone-outline" size={32} color={colors.tertiaryText} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Stay updated with channels
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.secondaryText }]}>
        Follow channels to get updates from people and organizations you care about.
      </Text>
      <TouchableOpacity 
        style={[styles.exploreButton, { backgroundColor: colors.primary }]}
        onPress={() => {/* Navigate to explore channels */}}
      >
        <Text style={styles.exploreButtonText}>Explore</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar 
        backgroundColor={colors.background} 
        barStyle={isDark ? 'light-content' : 'dark-content'}
        translucent={false}
      />

      {/* Custom Header */}
      <View style={[styles.header, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Updates</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => {/* Search */}} style={styles.headerIcon}>
            <Ionicons name="search" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleMenuPress} style={styles.headerIcon}>
            <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
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
          <View style={[styles.menuDropdown, { backgroundColor: colors.secondaryBackground, top: insets.top + 56 }]}>
            {menuOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.menuItem, { borderBottomColor: colors.border }]}
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

      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Status Section */}
        <View style={styles.statusSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Status</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.statusScroll}
            contentContainerStyle={styles.statusScrollContent}
          >
            {/* My Status Card */}
            <TouchableOpacity 
              style={styles.statusCard}
              onPress={handleTextStatusPress}
            >
              <View style={styles.statusImageContainer}>
                <View style={[styles.myStatusImage, { backgroundColor: colors.secondaryBackground }]}>
                  <Ionicons name="person" size={32} color={colors.primary} />
                </View>
                <View style={[styles.addStatusBadge, { backgroundColor: colors.primary }]}>
                  <Ionicons name="add" size={14} color="#FFFFFF" />
                </View>
              </View>
              <Text style={[styles.statusName, { color: colors.text }]}>Add status</Text>
            </TouchableOpacity>

            {/* Other Statuses */}
            {statuses.map((status, index) => (
              <TouchableOpacity
                key={index}
                style={styles.statusCard}
                onPress={() => viewStatus(status)}
              >
                <View style={styles.statusImageContainer}>
                  <View style={[
                    styles.statusRing,
                    { borderColor: status.viewed ? colors.border : colors.primary }
                  ]}>
                    {status.profilePicUrl ? (
                      <Image 
                        source={{ uri: status.profilePicUrl }} 
                        style={styles.statusImage}
                      />
                    ) : (
                      <View style={[styles.statusImage, { backgroundColor: colors.secondaryBackground }]}>
                        <Text style={[styles.statusInitial, { color: colors.text }]}>
                          {status.name?.charAt(0) || '?'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <Text style={[styles.statusName, { color: colors.text }]} numberOfLines={1}>
                  {status.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Channels Section */}
        <View style={styles.channelsSection}>
          <View style={styles.channelHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Channels</Text>
            <TouchableOpacity onPress={() => {/* Navigate to explore */}}>
              <Text style={[styles.exploreLink, { color: colors.primary }]}>Explore</Text>
            </TouchableOpacity>
          </View>

          {channels.length === 0 ? (
            <EmptyChannelsView />
          ) : (
            <>
              {channels.map((channel, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.channelItem, { borderBottomColor: colors.border }]}
                >
                  <View style={styles.channelLeft}>
                    <View style={[styles.channelAvatar, { backgroundColor: colors.secondaryBackground }]}>
                      <Ionicons name="megaphone" size={24} color={colors.primary} />
                    </View>
                    <View style={styles.channelInfo}>
                      <View style={styles.channelNameRow}>
                        <Ionicons name="volume-medium" size={14} color={colors.tertiaryText} style={styles.channelIcon} />
                        <Text style={[styles.channelName, { color: colors.text }]}>{channel.name}</Text>
                      </View>
                      <Text style={[styles.channelMessage, { color: colors.secondaryText }]} numberOfLines={1}>
                        {channel.lastMessage || 'No messages yet'}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.channelTime, { color: colors.tertiaryText }]}>
                    {formatTime(channel.lastMessageTime)}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Find channels to follow */}
              <View style={styles.findChannelsSection}>
                <Text style={[styles.findChannelsText, { color: colors.secondaryText }]}>
                  Find channels to follow
                </Text>
                <TouchableOpacity style={styles.channelSuggestion}>
                  <View style={styles.channelAvatar}>
                    <Image 
                      source={{ uri: 'https://via.placeholder.com/48' }} 
                      style={styles.suggestionAvatar}
                    />
                  </View>
                  <View style={styles.suggestionInfo}>
                    <Text style={[styles.suggestionName, { color: colors.text }]}>
                      Stickers Lovers🥺🌹
                    </Text>
                    <Text style={[styles.suggestionFollowers, { color: colors.secondaryText }]}>
                      187K followers
                    </Text>
                  </View>
                  <TouchableOpacity style={[styles.followButton, { backgroundColor: colors.primary }]}>
                    <Text style={styles.followButtonText}>Follow</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[styles.fabSecondary, { backgroundColor: colors.secondaryBackground }]}
          onPress={handleTextStatusPress}
        >
          <Ionicons name="pencil" size={20} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fabPrimary, { backgroundColor: colors.primary }]}
          onPress={handleCameraPress}
        >
          <Ionicons name="camera" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
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
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
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
    right: 16,
    width: 200,
    borderRadius: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 999,
    overflow: 'hidden',
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 0.5,
  },
  menuItemText: {
    fontSize: 16,
  },
  statusSection: {
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  statusScroll: {
    paddingLeft: 16,
  },
  statusScrollContent: {
    paddingRight: 16,
    gap: 12,
  },
  statusCard: {
    alignItems: 'center',
    width: 80,
  },
  statusImageContainer: {
    position: 'relative',
    marginBottom: 6,
  },
  myStatusImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addStatusBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  statusRing: {
    padding: 3,
    borderRadius: 35,
    borderWidth: 2.5,
  },
  statusImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusInitial: {
    fontSize: 24,
    fontWeight: '500',
  },
  statusName: {
    fontSize: 12,
    textAlign: 'center',
  },
  channelsSection: {
    marginTop: 20,
    paddingBottom: 100,
  },
  channelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  exploreLink: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyChannels: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  exploreButton: {
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 24,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  channelItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.2,
    borderBottomColor: '#DADADA',
  },
  channelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  channelAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  channelInfo: {
    flex: 1,
  },
  channelNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  channelIcon: {
    marginRight: 4,
  },
  channelName: {
    fontSize: 16,
    fontWeight: '500',
  },
  channelMessage: {
    fontSize: 14,
  },
  channelTime: {
    fontSize: 12,
    marginLeft: 8,
  },
  findChannelsSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  findChannelsText: {
    fontSize: 14,
    marginBottom: 16,
  },
  channelSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  suggestionAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  suggestionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  suggestionFollowers: {
    fontSize: 13,
  },
  followButton: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: Platform.OS === 'ios' ? 100 : 76,
    gap: 12,
  },
  fabPrimary: {
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
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});
