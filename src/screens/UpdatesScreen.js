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
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { callAPI, API_ENDPOINTS } from '../services/api';

export default function UpdatesScreen({ navigation }) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [statuses, setStatuses] = useState([]);
  const [channels, setChannels] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [fabAnimation] = useState(new Animated.Value(1));

  useEffect(() => {
    loadStatuses();
    loadChannels();
  }, []);

  const loadStatuses = async () => {
    try {
      if (user?.phone) {
        const response = await callAPI(API_ENDPOINTS.GET_STATUS_UPDATES(user.phone));
        setStatuses(response.statusUpdates || []);
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
        const response = await callAPI(API_ENDPOINTS.GET_CHANNELS(user.phone));
        setChannels(response.channels || []);
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

  const handleGalleryPress = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
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
    
    if (hours < 1) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return 'Yesterday';
  };

  const viewStatus = async (status) => {
    try {
      await callAPI(API_ENDPOINTS.VIEW_STATUS(user.phone, status.jid, [status.key]));
    } catch (error) {
      console.error('Error viewing status:', error);
    }
  };

  const EmptyChannelsView = () => (
    <View style={styles.channelsEmpty}>
      <View style={[styles.channelIconContainer, { backgroundColor: colors.secondaryBackground }]}>
        <Ionicons name="megaphone-outline" size={40} color={colors.icon} />
      </View>
      <Text style={[styles.channelTitle, { color: colors.text }]}>
        Stay updated on topics that matter to you
      </Text>
      <Text style={[styles.channelText, { color: colors.secondaryText }]}>
        Find channels to follow
      </Text>
      <TouchableOpacity style={[styles.findButton, { backgroundColor: colors.primary }]}>
        <Text style={styles.findButtonText}>Find channels</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
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
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>Status</Text>

          <TouchableOpacity
            style={[styles.myStatus, { borderBottomColor: colors.divider }]}
            onPress={handleTextStatusPress}
          >
            <View style={styles.statusAvatarContainer}>
              <View style={[styles.statusAvatar, { backgroundColor: colors.secondaryBackground }]}>
                <Ionicons name="person" size={28} color={colors.primary} />
              </View>
              <View style={[styles.addBadge, { backgroundColor: colors.primary }]}>
                <Ionicons name="add" size={16} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.statusContent}>
              <Text style={[styles.statusName, { color: colors.text }]}>My status</Text>
              <Text style={[styles.statusText, { color: colors.secondaryText }]}>
                Tap to add status update
              </Text>
            </View>
          </TouchableOpacity>

          {statuses.length > 0 && (
            <View style={styles.recentUpdates}>
              <Text style={[styles.subsectionTitle, { color: colors.secondaryText }]}>
                Recent updates
              </Text>
              {statuses.map((status, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.statusItem, { borderBottomColor: colors.divider }]}
                  onPress={() => viewStatus(status)}
                >
                  <View style={[
                    styles.statusRing,
                    { borderColor: status.viewed ? colors.divider : colors.primary }
                  ]}>
                    <View style={[styles.statusAvatar, { backgroundColor: colors.secondaryBackground }]}>
                      <Text style={[styles.avatarText, { color: colors.text }]}>
                        {status.name?.charAt(0) || '?'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.statusContent}>
                    <Text style={[styles.statusName, { color: colors.text }]}>{status.name}</Text>
                    <Text style={[styles.statusTime, { color: colors.secondaryText }]}>
                      {formatTime(status.timestamp)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={[styles.section, styles.channelsSection]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>Channels</Text>
            <TouchableOpacity>
              <Ionicons name="add-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          {channels.length === 0 ? (
            <EmptyChannelsView />
          ) : (
            channels.map((channel, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.channelItem, { borderBottomColor: colors.divider }]}
              >
                <View style={[styles.channelAvatar, { backgroundColor: colors.secondaryBackground }]}>
                  <Ionicons name="megaphone" size={24} color={colors.primary} />
                </View>
                <View style={styles.channelInfo}>
                  <Text style={[styles.channelName, { color: colors.text }]}>{channel.name}</Text>
                  <Text style={[styles.channelFollowers, { color: colors.secondaryText }]}>
                    {channel.followers || 0} followers
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

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
  section: {
    paddingVertical: 8,
  },
  channelsSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subsectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    paddingHorizontal: 16,
    paddingVertical: 8,
    textTransform: 'capitalize',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  myStatus: {
    flexDirection: 'row',
    padding: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 0.5,
  },
  statusAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  statusAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  statusRing: {
    padding: 2,
    borderRadius: 28,
    borderWidth: 2,
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '500',
  },
  statusItem: {
    flexDirection: 'row',
    padding: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 0.5,
  },
  statusContent: {
    flex: 1,
  },
  statusName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  statusText: {
    fontSize: 14,
  },
  statusTime: {
    fontSize: 13,
    marginTop: 2,
  },
  recentUpdates: {
    marginTop: 8,
  },
  channelsEmpty: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  channelIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  channelTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  channelText: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  findButton: {
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 20,
  },
  findButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  channelItem: {
    flexDirection: 'row',
    padding: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 0.5,
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
  channelName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  channelFollowers: {
    fontSize: 13,
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
