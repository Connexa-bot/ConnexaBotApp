
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { callAPI, API_ENDPOINTS } from '../services/api';

export default function GroupCreateScreen() {
  const [groupName, setGroupName] = useState('');
  const [groupIcon, setGroupIcon] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [creating, setCreating] = useState(false);
  const navigation = useNavigation();
  const { user } = useAuth();
  const { colors } = useTheme();

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const response = await callAPI(API_ENDPOINTS.GET_CONTACTS(user.phone));
      setContacts(response.contacts || []);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const toggleContact = (contact) => {
    setSelectedContacts(prev =>
      prev.find(c => c.id === contact.id)
        ? prev.filter(c => c.id !== contact.id)
        : [...prev, contact]
    );
  };

  const pickGroupIcon = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setGroupIcon(result.assets[0].uri);
    }
  };

  const createGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (selectedContacts.length === 0) {
      Alert.alert('Error', 'Please select at least one participant');
      return;
    }

    setCreating(true);
    try {
      const participants = selectedContacts.map(c => c.id);
      await callAPI(API_ENDPOINTS.CREATE_GROUP(user.phone, groupName, participants));
      Alert.alert('Success', 'Group created successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  const renderContact = ({ item }) => {
    const isSelected = selectedContacts.find(c => c.id === item.id);
    return (
      <TouchableOpacity
        style={[styles.contactItem, { borderBottomColor: colors.border }]}
        onPress={() => toggleContact(item)}
      >
        <View style={[styles.checkbox, isSelected && { backgroundColor: colors.primary }]}>
          {isSelected && <Ionicons name="checkmark" size={18} color="#fff" />}
        </View>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{item.name?.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={[styles.contactName, { color: colors.text }]}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.header }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Group</Text>
        <TouchableOpacity onPress={createGroup} disabled={creating}>
          <Ionicons name="checkmark" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.groupInfoSection}>
        <TouchableOpacity onPress={pickGroupIcon} style={styles.iconPicker}>
          {groupIcon ? (
            <Image source={{ uri: groupIcon }} style={styles.groupIcon} />
          ) : (
            <View style={[styles.groupIconPlaceholder, { backgroundColor: colors.secondaryBackground }]}>
              <Ionicons name="camera" size={32} color={colors.icon} />
            </View>
          )}
        </TouchableOpacity>
        <TextInput
          style={[styles.groupNameInput, { color: colors.text, borderBottomColor: colors.border }]}
          placeholder="Group name"
          placeholderTextColor={colors.secondaryText}
          value={groupName}
          onChangeText={setGroupName}
        />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>
        Add Participants ({selectedContacts.length})
      </Text>

      <FlatList
        data={contacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 48,
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '600' },
  groupInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconPicker: { marginRight: 16 },
  groupIcon: { width: 64, height: 64, borderRadius: 32 },
  groupIconPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupNameInput: {
    flex: 1,
    fontSize: 18,
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    padding: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 0.5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  contactName: { fontSize: 16 },
});
