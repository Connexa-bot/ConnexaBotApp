
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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { callAPI, API_ENDPOINTS } from '../services/api';

export default function BroadcastCreateScreen() {
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();
  const { user } = useAuth();
  const { colors } = useTheme();

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const response = await callAPI(API_ENDPOINTS.GET_CONTACTS(user.phone));
      const allContacts = response.contacts || [];
      // Filter out contacts without valid IDs to prevent duplicate key errors
      setContacts(allContacts.filter(c => c.id));
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

  const createBroadcast = async () => {
    if (selectedContacts.length === 0) {
      Alert.alert('Error', 'Please select at least one contact');
      return;
    }

    try {
      const participants = selectedContacts.map(c => c.id);
      await callAPI(API_ENDPOINTS.CREATE_BROADCAST(user.phone, participants));
      Alert.alert('Success', 'Broadcast list created successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to create broadcast list');
    }
  };

  const filteredContacts = searchQuery.trim()
    ? contacts.filter(c => c.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : contacts;

  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const removeSelectedContact = (contactToRemove) => {
    setSelectedContacts(prev => prev.filter(c => c.id !== contactToRemove.id));
  };

  const renderSelectedContact = (contact) => (
    <View key={contact.id} style={styles.selectedContactItem}>
      <View style={[styles.selectedAvatar, { backgroundColor: colors.primary }]}>
        {contact.profilePic ? (
          <Image source={{ uri: contact.profilePic }} style={styles.selectedAvatarImage} />
        ) : (
          <Text style={styles.selectedAvatarText}>{contact.name?.charAt(0).toUpperCase()}</Text>
        )}
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => removeSelectedContact(contact)}
        >
          <Ionicons name="close-circle" size={20} color="#8696A0" />
        </TouchableOpacity>
      </View>
      <Text style={[styles.selectedContactName, { color: colors.text }]} numberOfLines={1}>
        {contact.name}
      </Text>
    </View>
  );

  const renderContact = ({ item }) => {
    const isSelected = selectedContacts.some(c => c.id === item.id);
    return (
      <TouchableOpacity
        style={[styles.contactItem, { backgroundColor: colors.background }]}
        onPress={() => toggleContact(item)}
      >
        <View style={styles.contactLeft}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            {item.profilePic ? (
              <Image source={{ uri: item.profilePic }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{item.name?.charAt(0).toUpperCase()}</Text>
            )}
          </View>
          <View style={styles.contactInfo}>
            <Text style={[styles.contactName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.contactStatus, { color: colors.secondaryText }]}>
              {item.status || 'Available'}
            </Text>
          </View>
        </View>
        <View style={[
          styles.checkbox,
          isSelected && { backgroundColor: colors.primary, borderColor: colors.primary }
        ]}>
          {isSelected && <Ionicons name="checkmark" size={18} color="#fff" />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.header }]}>
        {!isSearchExpanded ? (
          <>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.headerText} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={[styles.headerTitle, { color: colors.headerText }]}>New broadcast</Text>
              <Text style={[styles.headerSubtitle, { color: colors.headerText, opacity: 0.7 }]}>
                {selectedContacts.length} of {contacts.length} selected
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={() => setIsSearchExpanded(true)}
            >
              <Ionicons name="search" size={24} color={colors.headerText} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity 
              onPress={() => {
                setIsSearchExpanded(false);
                setSearchQuery('');
              }}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={colors.headerText} />
            </TouchableOpacity>
            <TextInput
              style={[styles.searchInput, { color: colors.headerText }]}
              placeholder="Search..."
              placeholderTextColor={`${colors.headerText}80`}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close" size={24} color={colors.headerText} />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {selectedContacts.length > 0 && (
        <View style={[styles.selectedContactsRow, { borderBottomColor: colors.border }]}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectedContactsContent}
          >
            {selectedContacts.map((contact) => (
              <View key={contact.id}>
                {renderSelectedContact(contact)}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={[styles.infoBox, { backgroundColor: colors.secondaryBackground }]}>
        <Text style={[styles.infoText, { color: colors.secondaryText }]}>
          Only contacts with +{user?.phone?.substring(0, 3)} {user?.phone?.substring(3, 6)} {user?.phone?.substring(6, 9)} {user?.phone?.substring(9)} in their address book will receive your broadcast messages.
        </Text>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>
        Contacts on WhatsApp
      </Text>

      <FlatList
        data={filteredContacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {selectedContacts.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={createBroadcast}
        >
          <Ionicons name="checkmark" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 48,
    paddingBottom: 12,
  },
  backButton: { padding: 8 },
  headerCenter: { flex: 1, marginLeft: 8 },
  headerTitle: { fontSize: 20, fontWeight: '500' },
  headerSubtitle: { fontSize: 14, marginTop: 2 },
  searchButton: { padding: 8 },
  searchInput: {
    flex: 1,
    fontSize: 18,
    marginHorizontal: 8,
  },
  selectedContactsRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  selectedContactsContent: {
    paddingHorizontal: 16,
  },
  selectedContactItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 70,
  },
  selectedAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  selectedAvatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  selectedAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  removeButton: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  selectedContactName: {
    fontSize: 12,
    textAlign: 'center',
  },
  infoBox: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
  },
  infoText: { fontSize: 14, lineHeight: 20 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 16, fontWeight: '500' },
  contactStatus: { fontSize: 14, marginTop: 2 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8696A0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
