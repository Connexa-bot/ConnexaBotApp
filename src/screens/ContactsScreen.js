import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Button,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { performContactAction } from '../services/api';
import Avatar from '../components/Avatar';

const ContactItem = ({ item, onBlock, onUnblock }) => (
  <View style={styles.contactItem}>
    <Avatar name={item.name || item.id.split('@')[0]} size={50} />
    <View style={styles.contactInfo}>
      <Text style={styles.contactName}>{item.name || 'Unknown'}</Text>
      <Text style={styles.contactId}>{item.id}</Text>
    </View>
    {item.isBlocked ? (
      <TouchableOpacity style={styles.unblockButton} onPress={() => onUnblock(item.id)}>
        <Text style={styles.buttonText}>Unblock</Text>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity style={styles.blockButton} onPress={() => onBlock(item.id)}>
        <Text style={styles.buttonText}>Block</Text>
      </TouchableOpacity>
    )}
  </View>
);

export default function ContactsScreen() {
  const { user } = useAuth();
  const phone = user?.phone;

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContacts = useCallback(async () => {
    if (!phone) return;
    setLoading(true);
    try {
      setError(null);
      // Fetch both all contacts and the list of blocked JIDs
      const [contactsResponse, blockedResponse] = await Promise.all([
        performContactAction({ phone, action: 'get' }),
        performContactAction({ phone, action: 'blocked' }),
      ]);

      const allContacts = contactsResponse.data.contacts || [];
      const blockedJids = new Set(blockedResponse.data.blocked || []);

      // Merge the two lists to determine the blocked status
      const contactsWithStatus = allContacts.map((contact) => ({
        ...contact,
        isBlocked: blockedJids.has(contact.id),
      }));

      setContacts(contactsWithStatus);
    } catch (_err) {
      setError('Failed to fetch contacts.');
    } finally {
      setLoading(false);
    }
  }, [phone]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleBlockToggle = async (contactId, shouldBlock) => {
    const action = shouldBlock ? 'block' : 'unblock';
    try {
      await performContactAction({ phone, action, jid: contactId });
      // Update the UI optimistically
      setContacts((prev) =>
        prev.map((contact) =>
          contact.id === contactId ? { ...contact, isBlocked: shouldBlock } : contact
        )
      );
    } catch (_err) {
      Alert.alert('Error', `Failed to ${action} contact.`);
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
            onBlock={() => handleBlockToggle(item.id, true)}
            onUnblock={() => handleBlockToggle(item.id, false)}
          />
        )}
        keyExtractor={(item) => item.id}
      />
    );
  };

  return <View style={styles.container}>{renderContent()}</View>;
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
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(134, 150, 160, 0.15)',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 15,
  },
  contactName: {
    color: '#E9EDEF',
    fontSize: 17,
    fontWeight: '600',
  },
  contactId: {
    color: '#8696A0',
    fontSize: 14,
  },
  blockButton: {
    backgroundColor: '#F15C6D',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  unblockButton: {
    backgroundColor: '#00A884',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  errorText: {
    textAlign: 'center',
    color: '#F15C6D',
  },
});