import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function CallsScreen() {
  const { colors } = useTheme();
  const [calls, setCall] = React.useState([]);

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
            size={16}
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
          size={24}
          color={colors.primary}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {calls.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="call-outline" size={64} color={colors.secondaryText} />
          <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
            No calls yet
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.secondaryText }]}>
            {/* ENDPOINT NEEDED: GET /api/calls/:phone - Returns call history */}
            Call history will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={calls}
          renderItem={renderCall}
          keyExtractor={(item) => item.id}
        />
      )}
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
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  callItem: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  callContent: {
    flex: 1,
  },
  callName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  callInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callTime: {
    fontSize: 14,
    marginLeft: 8,
  },
  callButton: {
    padding: 8,
  },
});
