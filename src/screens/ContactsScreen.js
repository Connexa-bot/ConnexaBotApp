import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { callAPI, API_ENDPOINTS } from '../services/api';

export default function ContactsScreen() {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { user } = useAuth();
  const { colors } = useTheme();

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [searchQuery, contacts]);

  const loadContacts = async () => {
    try {
      if (user?.phone) {
        const response = await callAPI(API_ENDPOINTS.GET_CONTACTS(user.phone));
        setContacts(response.contacts || []);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const filterContacts = () => {
    if (!searchQuery.trim()) {
      setFilteredContacts(contacts);
      return;
    }
    const filtered = contacts.filter(contact =>
      contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.number?.includes(searchQuery)
    );
    setFilteredContacts(filtered);
  };

  const handleContactPress = (contact) => {
    navigation.navigate('ChatView', {
      chat: {
        id: contact.id,
        name: contact.name,
        profilePic: contact.profilePic,
      }
    });
  };

  const handleNewContact = () => {
    Alert.alert('Add Contact', 'This feature requires native contact permissions');
  };

  const renderContact = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.contactItem, { backgroundColor: colors.background }]}
      onPress={() => handleContactPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
        <Text style={styles.avatarText}>
          {item.name?.charAt(0).toUpperCase() || '?'}
        </Text>
      </View>
      <View style={[styles.contactInfo, { borderBottomColor: colors.border }]}>
        <Text style={[styles.contactName, { color: colors.text }]} numberOfLines={1}>
          {item.name || item.number}
        </Text>
        <Text style={[styles.contactStatus, { color: colors.secondaryText }]} numberOfLines={1}>
          {item.status || item.number}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.header }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Select contact</Text>
          <Text style={styles.headerSubtitle}>{filteredContacts.length} contacts</Text>
        </View>
        <TouchableOpacity 
          onPress={handleNewContact}
          style={styles.actionButton}
        >
          <Ionicons name="person-add-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.secondaryBackground }]}>
        <Ionicons name="search" size={20} color={colors.secondaryText} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search contacts..."
          placeholderTextColor={colors.secondaryText}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.secondaryText} />
          </TouchableOpacity>
        )}
      </View>

      {/* Contacts List */}
      <FlatList
        data={filteredContacts}
        renderItem={renderContact}
        keyExtractor={(item, index) => item.id?.toString() || `contact-${index}`}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={loadContacts}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={filteredContacts.length === 0 ? styles.emptyListContainer : null}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="people-outline" size={64} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {searchQuery ? 'No contacts found' : 'No contacts yet'}
            </Text>
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
              {searchQuery 
                ? 'Try searching with a different name or number'
                : 'Add contacts to start messaging'
              }
            </Text>
          </View>
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
    paddingHorizontal: 8,
    paddingTop: 48,
    paddingBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  headerSubtitle: {
    color: '#fff',
    fontSize: 13,
    opacity: 0.8,
    marginTop: 2,
  },
  actionButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginVertical: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    paddingVertical: 4,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F2F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  contactItem: {
    flexDirection: 'row',
    paddingLeft: 16,
    paddingVertical: 12,
    alignItems: 'center',
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
    color: '#fff',
    fontSize: 20,
    fontWeight: '500',
  },
  contactInfo: {
    flex: 1,
    paddingRight: 16,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
  },
  contactName: {
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 4,
  },
  contactStatus: {
    fontSize: 14,
    lineHeight: 18,
  },
});
