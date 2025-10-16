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
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import API, { callAPI, API_ENDPOINTS } from '../services/api';

export default function GroupCreateScreen() {
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [frequentContacts, setFrequentContacts] = useState([]);
  const navigation = useNavigation();
  const { user } = useAuth();
  const { colors } = useTheme();

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const response = await callAPI(API.Contact.getAll(user.phone));

      // Handle different response formats
      let contactsList = [];
      if (Array.isArray(response)) {
        contactsList = response;
      } else if (response.contacts && Array.isArray(response.contacts)) {
        contactsList = response.contacts;
      } else if (response.data && Array.isArray(response.data)) {
        contactsList = response.data;
      }

      setContacts(contactsList);
      // Get first 3 as frequent contacts - only include if they have valid IDs
      const frequent = contactsList.slice(0, 3).filter(c => c.id);
      setFrequentContacts(frequent);
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

  const proceedToGroupInfo = () => {
    if (selectedContacts.length === 0) {
      Alert.alert('Error', 'Please select at least one participant');
      return;
    }
    // Navigate to group info screen (subject, icon)
    navigation.navigate('GroupInfo', { selectedContacts });
  };

  const filteredContacts = searchQuery.trim()
    ? contacts.filter(c => c.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : contacts;

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
        <View style={[
          styles.checkbox,
          isSelected && { backgroundColor: colors.primary, borderColor: colors.primary }
        ]}>
          {isSelected && <Ionicons name="checkmark" size={18} color="#fff" />}
        </View>
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
            {item.status || 'Hey there! I am using WhatsApp.'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.header }]}>
        {!isSearchExpanded ? (
          <>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.headerText} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={[styles.headerTitle, { color: colors.headerText }]}>Add members</Text>
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

      {frequentContacts.length > 0 && !searchQuery && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>
            Frequently contacted
          </Text>
          <FlatList
            data={frequentContacts}
            renderItem={renderContact}
            keyExtractor={(item) => `frequent-${item.id}`}
          />
        </>
      )}

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
          onPress={proceedToGroupInfo}
        >
          <Ionicons name="arrow-forward" size={28} color="#FFFFFF" />
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8696A0',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
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