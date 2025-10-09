import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export default function UpdatesScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [statuses, setStatuses] = React.useState([]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>Status</Text>
        
        <TouchableOpacity
          style={[styles.myStatus, { borderBottomColor: colors.border }]}
        >
          <View style={[styles.statusAvatar, { backgroundColor: colors.secondaryBackground }]}>
            <Ionicons name="add" size={24} color={colors.icon} />
          </View>
          <View style={styles.statusContent}>
            <Text style={[styles.statusName, { color: colors.text }]}>My status</Text>
            <Text style={[styles.statusText, { color: colors.secondaryText }]}>
              Tap to add status update
            </Text>
          </View>
        </TouchableOpacity>

        {statuses.length === 0 ? (
          <View style={styles.emptySection}>
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
              {/* ENDPOINT NEEDED: GET /api/status/:phone - Returns status updates */}
              No recent updates
            </Text>
          </View>
        ) : (
          statuses.map((status) => (
            <TouchableOpacity
              key={status.id}
              style={[styles.statusItem, { borderBottomColor: colors.border }]}
            >
              <View style={[styles.statusAvatar, { borderColor: colors.primary, borderWidth: 2 }]}>
                <Text style={[styles.avatarText, { color: colors.text }]}>
                  {status.name.charAt(0)}
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

      <View style={[styles.section, { marginTop: 20 }]}>
        <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>Channels</Text>
        <View style={styles.emptySection}>
          <Ionicons name="megaphone-outline" size={48} color={colors.secondaryText} />
          <Text style={[styles.emptyText, { color: colors.secondaryText, marginTop: 12 }]}>
            {/* ENDPOINT NEEDED: GET /api/channels/:phone - Returns channel subscriptions */}
            Stay updated on topics that matter to you
          </Text>
          <TouchableOpacity style={[styles.findButton, { backgroundColor: colors.primary }]}>
            <Text style={styles.findButtonText}>Find channels to follow</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 8,
    textTransform: 'uppercase',
  },
  myStatus: {
    flexDirection: 'row',
    padding: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  statusItem: {
    flexDirection: 'row',
    padding: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  statusAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
  },
  statusContent: {
    flex: 1,
  },
  statusName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  statusText: {
    fontSize: 14,
  },
  statusTime: {
    fontSize: 14,
  },
  emptySection: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  findButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 16,
  },
  findButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
