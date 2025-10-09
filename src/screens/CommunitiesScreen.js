import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Button,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { getGroups } from '../services/api';
import { useNavigation } from '@react-navigation/native';

const CommunityItem = ({ name, icon }) => (
  <TouchableOpacity style={styles.communityItem}>
    <View style={styles.communityIconContainer}>
      <MaterialCommunityIcons name={icon} size={24} color="#FFF" />
    </View>
    <Text style={styles.communityName}>{name}</Text>
  </TouchableOpacity>
);

export default function CommunitiesScreen() {
  const navigation = useNavigation();
  const { user, isConnected } = useAuth();
  const phone = user?.phone;

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGroups = useCallback(async () => {
    if (!phone) return;
    setLoading(true);
    try {
      setError(null);
      const { data } = await getGroups(phone);
      setGroups(data.groups || []);
    } catch (_err) {
      setError('Failed to fetch communities.');
    } finally {
      setLoading(false);
    }
  }, [phone]);

  useEffect(() => {
    if (isConnected) {
      fetchGroups();
    }
  }, [isConnected, fetchGroups]);

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator style={{ marginTop: 50 }} size="large" color="#00A884" />;
    }
    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Retry" onPress={fetchGroups} color="#00A884" />
        </View>
      );
    }
    if (groups.length === 0) {
      return <Text style={styles.emptyText}>No communities found.</Text>;
    }
    return groups.map((group) => (
      <CommunityItem key={group.id} name={group.subject} icon="robot" />
    ));
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchGroups} tintColor="#00A884" />
      }
    >
      <TouchableOpacity
        style={styles.newCommunityButton}
        onPress={() => navigation.navigate('CreateGroup')}
      >
        <View style={styles.newCommunityIconContainer}>
          <MaterialCommunityIcons name="account-group-outline" size={30} color="#111B21" />
          <View style={styles.plusIcon}>
            <MaterialCommunityIcons name="plus-circle" size={20} color="#00A884" />
          </View>
        </View>
        <Text style={styles.newCommunityText}>New community</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      {renderContent()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111B21',
  },
  newCommunityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  newCommunityIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#8696A0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  plusIcon: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#111B21',
    borderRadius: 12,
  },
  newCommunityText: {
    color: '#E9EDEF',
    fontSize: 17,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(134, 150, 160, 0.15)',
    marginVertical: 10,
  },
  communityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  communityIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(134, 150, 160, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  communityName: {
    color: '#E9EDEF',
    fontSize: 17,
    fontWeight: '600',
  },
});