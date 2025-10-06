import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CommunityItem = ({ name, icon }) => (
  <TouchableOpacity style={styles.communityItem}>
    <View style={styles.communityIconContainer}>
      <MaterialCommunityIcons name={icon} size={24} color="#FFF" />
    </View>
    <Text style={styles.communityName}>{name}</Text>
  </TouchableOpacity>
);

export default function CommunitiesScreen() {
  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.newCommunityButton}>
        <View style={styles.newCommunityIconContainer}>
          <MaterialCommunityIcons name="account-group-outline" size={30} color="#111B21" />
          <View style={styles.plusIcon}>
            <MaterialCommunityIcons name="plus-circle" size={20} color="#00A884" />
          </View>
        </View>
        <Text style={styles.newCommunityText}>New community</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* Mock Community */}
      <CommunityItem name="ConnexaBot Devs" icon="robot" />
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