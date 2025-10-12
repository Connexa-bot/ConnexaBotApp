import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { callAPI, API_ENDPOINTS } from '../services/api';

export default function CallsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [calls, setCalls] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCalls();
  }, []);

  const loadCalls = async () => {
    try {
      if (user?.phone) {
        const response = await callAPI(API_ENDPOINTS.GET_CALLS(user.phone));
        setCalls(response.data?.calls || []);
      }
    } catch (error) {
      console.error('Error loading calls:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCalls();
  };

  const renderCall = ({ item }) => (
    <TouchableOpacity
      style={[styles.callItem, { backgroundColor: colors.background, borderBottomColor: colors.border }]}
    >
      <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
        <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
      </View>
      
      <View style={styles.callContent}>
        <Text style={[styles.callName, { color: colors.text }]}>{item.name}</Text>
        <View style={styles.callInfo}>
          <Ionicons
            name={item.type === 'incoming' ? 'arrow-down' : 'arrow-up'}
            size={14}
            color={item.missed ? '#F44336' : colors.secondaryText}
          />
          <Text style={[styles.callTime, { color: colors.secondaryText }]}>
            {item.time}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.callButton}>
        <Ionicons
          name={item.video ? 'videocam' : 'call'}
          size={22}
          color={colors.primary}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={calls}
        renderItem={renderCall}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconContainer, { backgroundColor: colors.secondaryBackground }]}>
              <Ionicons name="call-outline" size={48} color={colors.icon} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No recent calls
            </Text>
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
              Make a call to see your call history here
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
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  callItem: {
    flexDirection: 'row',
    padding: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 0.5,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '500',
  },
  callContent: {
    flex: 1,
  },
  callName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  callInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callTime: {
    fontSize: 14,
    marginLeft: 6,
  },
  callButton: {
    padding: 8,
  },
});
