
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function ContactProfileScreen({ route, navigation }) {
  const { contact } = route.params;
  const { colors, isDark } = useTheme();

  const handleMessage = () => {
    navigation.navigate('ChatView', {
      chat: {
        id: contact.id,
        name: contact.name,
        profilePic: contact.profilePic,
      }
    });
  };

  const handleVideoCall = () => {
    Alert.alert('Video Call', 'Video calling is not supported');
  };

  const handleVoiceCall = () => {
    Alert.alert('Voice Call', 'Voice calling is not supported');
  };

  const ActionButton = ({ icon, label, color, onPress }) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: color || colors.primary }]}>
        <Ionicons name={icon} size={24} color="#FFFFFF" />
      </View>
      <Text style={[styles.actionLabel, { color: colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );

  const InfoRow = ({ icon, label, value }) => (
    <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
      <Ionicons name={icon} size={24} color={colors.primary} style={styles.infoIcon} />
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.header }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.headerText} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerAction}>
            <Ionicons name="videocam" size={24} color={colors.headerText} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerAction}>
            <Ionicons name="call" size={24} color={colors.headerText} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerAction}>
            <Ionicons name="ellipsis-vertical" size={24} color={colors.headerText} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView>
        {/* Profile Section */}
        <View style={[styles.profileSection, { backgroundColor: colors.secondaryBackground }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {contact.name?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={[styles.contactName, { color: colors.text }]}>{contact.name}</Text>
          <Text style={[styles.contactNumber, { color: colors.secondaryText }]}>
            {contact.number || contact.id}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={[styles.actionsContainer, { backgroundColor: colors.secondaryBackground }]}>
          <ActionButton icon="chatbubble" label="Message" onPress={handleMessage} />
          <ActionButton icon="videocam" label="Video" color="#00A884" onPress={handleVideoCall} />
          <ActionButton icon="call" label="Audio" color="#00A884" onPress={handleVoiceCall} />
        </View>

        {/* Contact Info */}
        <View style={[styles.section, { backgroundColor: colors.secondaryBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>Contact info</Text>
          <InfoRow 
            icon="call-outline" 
            label="Phone" 
            value={contact.number || contact.id}
          />
          {contact.status && (
            <InfoRow 
              icon="information-circle-outline" 
              label="About" 
              value={contact.status}
            />
          )}
        </View>

        {/* Settings */}
        <View style={[styles.section, { backgroundColor: colors.secondaryBackground }]}>
          <TouchableOpacity style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <Ionicons name="notifications-outline" size={24} color={colors.icon} />
            <Text style={[styles.settingText, { color: colors.text }]}>Notifications</Text>
            <Text style={[styles.settingValue, { color: colors.secondaryText }]}>On</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <Ionicons name="lock-closed-outline" size={24} color={colors.icon} />
            <Text style={[styles.settingText, { color: colors.text }]}>Encryption</Text>
            <Text style={[styles.settingValue, { color: colors.secondaryText }]}>
              Messages are end-to-end encrypted
            </Text>
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={[styles.section, { backgroundColor: colors.secondaryBackground }]}>
          <TouchableOpacity style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <Ionicons name="ban-outline" size={24} color="#F44336" />
            <Text style={[styles.settingText, { color: '#F44336' }]}>Block contact</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <Ionicons name="thumbs-down-outline" size={24} color="#F44336" />
            <Text style={[styles.settingText, { color: '#F44336' }]}>Report contact</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: Platform.OS === 'ios' ? 50 : 10,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 20,
  },
  headerAction: {
    padding: 8,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '600',
  },
  contactName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactNumber: {
    fontSize: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    marginBottom: 8,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 13,
  },
  section: {
    marginBottom: 8,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
  },
  infoIcon: {
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
  },
  settingText: {
    fontSize: 16,
    marginLeft: 16,
    flex: 1,
  },
  settingValue: {
    fontSize: 14,
  },
});
