import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Avatar from '../components/Avatar';

// A static component representing a status item.
const StatusItem = ({ name, time, isMyStatus = false }) => (
  <TouchableOpacity style={styles.statusItem} disabled={!isMyStatus}>
    <View style={styles.avatarContainer}>
      <Avatar name={name} size={60} />
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
  // Since there are no backend endpoints for statuses, this screen is a placeholder.
  // It shows a static UI representing where status updates would appear.

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Status</Text>
          <TouchableOpacity>
            <MaterialIcons name="more-vert" size={24} color="#8696A0" />
          </TouchableOpacity>
        </View>

        <StatusItem name="My status" time="Tap to add status update" isMyStatus />

        <Text style={styles.sectionTitle}>Recent updates</Text>
        <View style={styles.centered}>
            <Text style={styles.placeholderText}>
                Status updates from your contacts will appear here.
            </Text>
        </View>

      </ScrollView>
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fabSecondary} disabled>
          <MaterialIcons name="edit" size={20} color="#8696A0" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.fabPrimary} disabled>
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
    padding: 50,
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
  placeholderText: {
      color: '#8696A0',
      textAlign: 'center',
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
    opacity: 0.5,
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
    opacity: 0.5,
  },
});