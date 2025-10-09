import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Button,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { performContactAction, performGroupAction } from '../services/api';
import Avatar from '../components/Avatar';
import { useNavigation } from '@react-navigation/native';

const ContactItem = ({ item, onSelect, isSelected }) => (
  <TouchableOpacity
    style={[styles.contactItem, isSelected && styles.selectedContact]}
    onPress={() => onSelect(item.id)}
  >
    <Avatar name={item.name || item.id.split('@')[0]} size={50} />
    <Text style={styles.contactName}>{item.name || 'Unknown'}</Text>
  </TouchableOpacity>
);

export default function CreateGroupScreen() {
  const { user } = useAuth();
  const phone = user?.phone;
  const navigation = useNavigation();

  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const fetchContacts = useCallback(async () => {
    if (!phone) return;
    setLoading(true);
    try {
      setError(null);
      const { data } = await performContactAction({ phone, action: 'get' });
      setContacts(data.contacts || []);
    } catch (_err) {
      setError('Failed to fetch contacts.');
    } finally {
      setLoading(false);
    }
  }, [phone]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleSelectContact = (contactId) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      alert('Please enter a group name.');
      return;
    }
    if (selectedContacts.length === 0) {
      alert('Please select at least one contact.');
      return;
    }
    setIsCreating(true);
    try {
      await performGroupAction({
        phone,
        action: 'create',
        name: groupName,
        participants: selectedContacts,
      });
      navigation.goBack(); // Go back to the communities screen after creation
    } catch (_err) {
      alert('Failed to create group.');
    } finally {
      setIsCreating(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator style={{ marginTop: 50 }} size="large" color="#00A884" />;
    }
    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Retry" onPress={fetchContacts} color="#00A884" />
        </View>
      );
    }
    return (
      <FlatList
        data={contacts}
        renderItem={({ item }) => (
          <ContactItem
            item={item}
            onSelect={handleSelectContact}
            isSelected={selectedContacts.includes(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
      />
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Group Name"
        placeholderTextColor="#8696A0"
        value={groupName}
        onChangeText={setGroupName}
      />
      <View style={styles.divider} />
      <Text style={styles.title}>Select Participants</Text>
      {renderContent()}
      <TouchableOpacity
        style={[styles.createButton, (isCreating || selectedContacts.length === 0) && styles.disabledButton]}
        onPress={handleCreateGroup}
        disabled={isCreating || selectedContacts.length === 0}
      >
        <Text style={styles.createButtonText}>
          {isCreating ? 'Creating...' : 'Create Group'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111B21',
    padding: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#202C33',
    color: '#E9EDEF',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(134, 150, 160, 0.15)',
    marginVertical: 10,
  },
  title: {
    color: '#E9EDEF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  selectedContact: {
    backgroundColor: 'rgba(0, 168, 132, 0.2)',
  },
  contactName: {
    color: '#E9EDEF',
    fontSize: 16,
    marginLeft: 15,
  },
  createButton: {
    backgroundColor: '#00A884',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#8696A0',
  },
  createButtonText: {
    color: '#111B21',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    textAlign: 'center',
    color: '#F15C6D',
  },
});