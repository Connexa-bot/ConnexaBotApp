import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  Alert,
  Modal,
  TextInput,
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
  const [refreshing, setRefreshing] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    loadStatuses();
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

  const onRefresh = () => {
    setRefreshing(true);
    loadStatuses();
  };

  const handlePostTextStatus = async () => {
    if (!statusText.trim()) {
      Alert.alert('Error', 'Please enter some text');
      return;
    }

    setPosting(true);
    try {
      await callAPI(API_ENDPOINTS.POST_STATUS(user.phone, 'text', statusText));
      setStatusText('');
      setShowPostModal(false);
      Alert.alert('Success', 'Status posted successfully');
      loadStatuses();
    } catch (error) {
      Alert.alert('Error', 'Failed to post status');
    } finally {
      setPosting(false);
    }
  };

  const handlePostImageStatus = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setPosting(true);
        await callAPI(API_ENDPOINTS.POST_STATUS(user.phone, 'image', result.assets[0].uri));
        Alert.alert('Success', 'Image status posted successfully');
        loadStatuses();
        setPosting(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to post image status');
      setPosting(false);
    }
  };

  const handlePostVideoStatus = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        quality: 1,
      });

      if (!result.canceled) {
        setPosting(true);
        await callAPI(API_ENDPOINTS.POST_STATUS(user.phone, 'video', result.assets[0].uri));
        Alert.alert('Success', 'Video status posted successfully');
        loadStatuses();
        setPosting(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to post video status');
      setPosting(false);
    }
  };

  const showStatusOptions = () => {
    Alert.alert(
      'Post Status',
      'Choose status type',
      [
        { text: 'Text', onPress: () => setShowPostModal(true) },
        { text: 'Image', onPress: handlePostImageStatus },
        { text: 'Video', onPress: handlePostVideoStatus },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const EmptyStatusView = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconContainer, { backgroundColor: colors.secondaryBackground }]}>
        <Ionicons name="sync-circle-outline" size={56} color={colors.icon} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No recent updates
      </Text>
      <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
        View updates from your contacts here
      </Text>
    </View>
  );

  const ChannelsEmptyView = () => (
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

  const renderStatusUpdate = ({ item }) => (
    <TouchableOpacity 
      style={styles.statusItem}
      onPress={() => viewStatus(item)}
      onLongPress={() => handleStatusAction(item)}
    >
      <View style={[styles.statusRing, { borderColor: item.viewed ? colors.divider : colors.primary }]}>
        <View style={[styles.statusAvatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.statusAvatarText}>
            {item.name?.charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={styles.statusInfo}>
        <Text style={[styles.statusName, { color: colors.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.statusTime, { color: colors.secondaryText }]}>
          {item.time}
        </Text>
      </View>
      {item.viewCount > 0 && (
        <View style={styles.viewCountContainer}>
          <Ionicons name="eye-outline" size={14} color={colors.secondaryText} />
          <Text style={[styles.viewCount, { color: colors.secondaryText }]}>
            {item.viewCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const viewStatus = async (status) => {
    try {
      await callAPI(API_ENDPOINTS.VIEW_STATUS(user.phone, status.jid, [status.key]));
      Alert.alert('Status Viewed', `Viewing ${status.name}'s status`);
    } catch (error) {
      console.error('Error viewing status:', error);
    }
  };

  const handleStatusAction = (status) => {
    Alert.alert(
      'Status Actions',
      'Choose an action',
      [
        { text: 'Reply to Status', onPress: () => replyToStatus(status) },
        { text: 'View Profile', onPress: () => {} },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const replyToStatus = (status) => {
    navigation.navigate('ChatView', { 
      chat: { id: status.jid, name: status.name },
      replyToStatus: true 
    });
  };

  return (
    <View style={{flex: 1}}>
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
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
          style={[styles.myStatus, { borderBottomColor: colors.border }]}
          onPress={showStatusOptions}
        >
          <View style={[styles.statusAvatar, { backgroundColor: colors.secondaryBackground }]}>
            <Ionicons name="add" size={24} color={colors.primary} />
          </View>
          <View style={styles.statusContent}>
            <Text style={[styles.statusName, { color: colors.text }]}>My status</Text>
            <Text style={[styles.statusText, { color: colors.secondaryText }]}>
              Tap to add status update
            </Text>
          </View>
        </TouchableOpacity>

        {statuses.length === 0 ? (
          <EmptyStatusView />
        ) : (
          statuses.map((status) => (
            <TouchableOpacity
              key={status.id}
              style={[styles.statusItem, { borderBottomColor: colors.border }]}
            >
              <View style={[styles.statusAvatar, { borderColor: colors.primary, borderWidth: 2, backgroundColor: colors.secondaryBackground }]}>
                <Text style={[styles.avatarText, { color: colors.text }]}>
                  {status.name?.charAt(0) || '?'}
                </Text>
              </View>
              <View style={styles.statusContent}>
                <Text style={[styles.statusName, { color: colors.text }]}>{status.name}</Text>
                <Text style={[styles.statusTime, { color: colors.secondaryText }]}>
                  {status.time}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={[styles.section, { marginTop: 24 }]}>
        <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>Channels</Text>
        <ChannelsEmptyView />
      </View>
    </ScrollView>

    <Modal
      visible={showPostModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowPostModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Post Text Status</Text>
            <TouchableOpacity onPress={() => setShowPostModal(false)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={[styles.textInput, { backgroundColor: colors.secondaryBackground, color: colors.text }]}
            placeholder="What's on your mind?"
            placeholderTextColor={colors.secondaryText}
            value={statusText}
            onChangeText={setStatusText}
            multiline
            maxLength={700}
          />

          <TouchableOpacity
            style={[styles.postButton, { backgroundColor: colors.primary }]}
            onPress={handlePostTextStatus}
            disabled={posting}
          >
            <Text style={styles.postButtonText}>Post Status</Text>
          </TouchableOpacity>
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
  section: {
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  myStatus: {
    flexDirection: 'row',
    padding: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 0.5,
  },
  statusItem: {
    flexDirection: 'row',
    padding: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 0.5,
  },
  statusAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '500',
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
  viewCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  viewCount: {
    fontSize: 12,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  textInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  postButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});