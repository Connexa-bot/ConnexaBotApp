import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import API, { callAPI } from '../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export default function CallsScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [calls, setCalls] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCalls();
  }, []);

  const loadCalls = async () => {
    try {
      if (user?.phone) {
        const response = await callAPI(API.Call.getHistory(user.phone));
        console.log('📊 Calls API response:', response);
        
        let callsList = [];
        
        if (response?.success === true && Array.isArray(response.calls)) {
          callsList = response.calls;
          console.log('✅ Successfully extracted', callsList.length, 'calls');
        } else if (Array.isArray(response)) {
          callsList = response;
        } else if (response?.calls && Array.isArray(response.calls)) {
          callsList = response.calls;
        } else if (response?.data?.calls && Array.isArray(response.data.calls)) {
          callsList = response.data.calls;
        } else if (response?.data && Array.isArray(response.data)) {
          callsList = response.data;
        } else {
          console.warn('⚠️ Unexpected calls response format:', typeof response);
        }
        
        setCalls(callsList);
      }
    } catch (error) {
      console.error('❌ Error loading calls:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCalls();
  };

  const handleMenuPress = () => {
    if (Platform.OS === 'ios') {
      const { ActionSheetIOS } = require('react-native');
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Clear call log', 'Settings', 'Cancel'],
          cancelButtonIndex: 2,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            navigation.navigate('Settings');
          }
        }
      );
    } else {
      navigation.navigate('Settings');
    }
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
      <StatusBar
        backgroundColor={colors.header}
        barStyle={isDark ? 'light-content' : 'dark-content'}
        translucent={false}
      />

      {/* Custom Header */}
      <View style={[styles.header, { backgroundColor: colors.header, paddingTop: insets.top }]}>
        <Text style={[styles.headerTitle, { color: colors.headerText }]}>Calls</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleMenuPress} style={styles.headerIcon}>
            <Ionicons name="ellipsis-vertical" size={24} color={colors.headerText} />
          </TouchableOpacity>
        </View>
      </View>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    padding: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
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
    borderBottomWidth: 0.2,
    borderBottomColor: '#DADADA',
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