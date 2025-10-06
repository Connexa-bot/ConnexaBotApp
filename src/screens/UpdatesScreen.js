import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Button, ActivityIndicator, Alert } from 'react-native';
import { useThemeContext } from '../contexts/ThemeContext';
import { useSocket } from '../contexts/SocketContext';
import { getStatuses, postStatus } from '../services/api';

export default function UpdatesScreen() {
  const { theme } = useThemeContext();
  const { phone } = useSocket();

  const [statuses, setStatuses] = useState([]);
  const [newStatus, setNewStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);

  const fetchStatuses = useCallback(async () => {
    if (!phone) {
        setLoading(false);
        return;
    };
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
    fetchStatuses();
  }, [fetchStatuses]);

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
      // Refresh statuses after posting
      await fetchStatuses();
    } catch (_err) {
      Alert.alert('Error', 'Failed to post status.');
    } finally {
      setPosting(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.statusItem, { borderColor: theme.colors.border }]}>
      <Text style={[styles.statusUser, { color: theme.colors.text }]}>{item.id.split('@')[0]}</Text>
      <Text style={[styles.statusContent, { color: theme.colors.text }]}>{item.content}</Text>
      <Text style={[styles.statusTimestamp, { color: theme.colors.text }]}>{item.timestamp}</Text>
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.loader}>
          <Text style={{ color: 'red', marginBottom: 20 }}>{error}</Text>
          <Button title="Retry" onPress={fetchStatuses} color={theme.colors.primary} />
        </View>
      );
    }
    return (
      <FlatList
        data={statuses}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id + index}
        ListEmptyComponent={<Text style={[styles.emptyText, {color: theme.colors.text}]}>No statuses to show.</Text>}
        refreshing={loading}
        onRefresh={fetchStatuses}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.postContainer}>
        <TextInput
          style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}
          placeholder="What's on your mind?"
          placeholderTextColor="gray"
          value={newStatus}
          onChangeText={setNewStatus}
        />
        <Button
          title={posting ? 'Posting...' : 'Post Status'}
          onPress={handlePostStatus}
          disabled={posting}
        />
      </View>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  postContainer: {
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  statusItem: {
    padding: 15,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  statusUser: {
      fontWeight: 'bold',
      fontSize: 16,
  },
  statusContent: {
    fontSize: 14,
    marginTop: 5,
  },
  statusTimestamp: {
      fontSize: 12,
      color: 'gray',
      marginTop: 10,
      textAlign: 'right',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
  },
});