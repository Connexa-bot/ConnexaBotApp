import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Button,
  RefreshControl,
} from 'react-native';
import { useSocket } from '../contexts/SocketContext';
import { getStatuses, postStatus } from '../services/api';
import { MaterialIcons } from '@expo/vector-icons';
import Avatar from '../components/Avatar';

const StatusItem = ({ name, time, avatar, isMyStatus = false }) => (
  <TouchableOpacity style={styles.statusItem}>
    <View style={styles.avatarContainer}>
      <Avatar source={avatar} name={name} size={60} />
      {isMyStatus && (
        <View style={styles.plusIcon}>
          <MaterialIcons name="add-circle" size={22} color="#00A884" />
        </View>
      )}
    </View>
    <View style={styles.statusInfo}>
      <Text style={styles.statusName}>{name}</Text>
      <Text style={styles.statusTime}>{time}</Text>
    </View>
  </TouchableOpacity>
);

export default function UpdatesScreen() {
  const { phone, isConnected } = useSocket();

  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [posting, setPosting] = useState(false);

  const fetchStatuses = useCallback(async () => {
    setLoading(true);
    try {
      setError(null);
      const { data } = await getStatuses(phone);
      setStatuses(data.statuses || []);
    } catch (_err) {
      setError('Failed to fetch statuses.');
    } finally {
      setLoading(false);
    }
  }, [phone]);

  useEffect(() => {
    if (isConnected) {
      fetchStatuses();
    }
  }, [isConnected, fetchStatuses]);

  const handlePostStatus = async () => {
    if (!newStatus.trim()) {
      Alert.alert('Error', 'Status cannot be empty.');
      return;
    }
    if (!phone) {
      Alert.alert('Error', 'Not connected.');
      return;
    }

    setPosting(true);
    try {
      await postStatus(phone, newStatus);
      setNewStatus('');
      setModalVisible(false);
      await fetchStatuses();
    } catch (_err) {
      Alert.alert('Error', 'Failed to post status.');
    } finally {
      setPosting(false);
    }
  };

  const recentUpdates = statuses.filter((s) => !s.isMyStatus);
  const viewedUpdates = []; // Placeholder for viewed logic

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator style={{ marginTop: 50 }} size="large" color="#00A884" />;
    }
    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Retry" onPress={fetchStatuses} color="#00A884" />
        </View>
      );
    }
    return (
      <>
        {recentUpdates.length > 0 && (
          <Text style={styles.sectionTitle}>Recent updates</Text>
        )}
        {recentUpdates.map((status, index) => (
          <StatusItem
            key={index}
            name={status.name || 'Unknown'}
            time={status.time || 'Just now'}
            avatar={status.avatar}
          />
        ))}
        {viewedUpdates.length > 0 && (
          <Text style={styles.sectionTitle}>Viewed updates</Text>
        )}
        {viewedUpdates.map((status, index) => (
          <StatusItem
            key={index}
            name={status.name}
            time={status.time}
            avatar={status.avatar}
          />
        ))}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <TextInput
              style={styles.modalInput}
              placeholder="Type a status"
              placeholderTextColor="#8696A0"
              value={newStatus}
              onChangeText={setNewStatus}
              multiline
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.postButton]}
                onPress={handlePostStatus}
                disabled={posting}
              >
                <Text style={styles.modalButtonText}>
                  {posting ? 'Posting...' : 'Post'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchStatuses} tintColor="#00A884" />
        }
      >
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Status</Text>
          <TouchableOpacity>
            <MaterialIcons name="more-vert" size={24} color="#8696A0" />
          </TouchableOpacity>
        </View>

        <StatusItem name="My status" time="Tap to add status update" isMyStatus />
        {renderContent()}
      </ScrollView>
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fabSecondary}
          onPress={() => setModalVisible(true)}
        >
          <MaterialIcons name="edit" size={20} color="#E9EDEF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.fabPrimary}>
          <MaterialIcons name="camera-alt" size={24} color="#111B21" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111B21',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  headerTitle: {
    fontSize: 22,
    color: '#E9EDEF',
    fontWeight: 'bold',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  avatarContainer: {
    marginRight: 15,
  },
  plusIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#111B21',
    borderRadius: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#E9EDEF',
  },
  statusTime: {
    fontSize: 15,
    color: '#8696A0',
  },
  sectionTitle: {
    color: '#8696A0',
    fontSize: 15,
    fontWeight: '600',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'rgba(134, 150, 160, 0.1)',
  },
  errorText: {
    textAlign: 'center',
    color: '#F15C6D',
    marginTop: 50,
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    alignItems: 'center',
  },
  fabPrimary: {
    backgroundColor: '#00A884',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  fabSecondary: {
    backgroundColor: '#202C33',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    marginBottom: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalView: {
    width: '80%',
    backgroundColor: '#202C33',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalInput: {
    width: '100%',
    height: 100,
    color: '#E9EDEF',
    fontSize: 18,
    textAlignVertical: 'top',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'flex-end',
    width: '100%',
  },
  modalButton: {
    padding: 10,
    marginLeft: 15,
  },
  postButton: {
    backgroundColor: '#00A884',
    borderRadius: 5,
  },
  modalButtonText: {
    color: '#E9EDEF',
    fontWeight: 'bold',
  },
});
