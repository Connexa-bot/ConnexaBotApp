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
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { colors, isDark } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const SettingItem = ({ icon, title, subtitle, onPress }) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: colors.background }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.secondaryBackground }]}>
        <Ionicons name={icon} size={24} color={colors.icon} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: colors.secondaryText }]}>
            {subtitle}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { 
        backgroundColor: colors.header,
        paddingTop: insets.top,
      }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.headerText} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.headerText }]}>Settings</Text>
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search-outline" size={24} color={colors.headerText} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Profile Section */}
        <TouchableOpacity 
          style={[styles.profileSection, { backgroundColor: colors.background }]}
          activeOpacity={0.7}
        >
          <View style={[styles.profileAvatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.profileAvatarText}>
              {user?.phone?.charAt(0) || 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>
              {user?.phone || 'User'}
            </Text>
            <Text style={[styles.profileStatus, { color: colors.secondaryText }]}>
              Testing API
            </Text>
          </View>
          <TouchableOpacity style={styles.qrButton}>
            <Ionicons name="qr-code-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Settings List */}
        <View style={styles.settingsList}>
          <SettingItem
            icon="key-outline"
            title="Account"
            subtitle="Security notifications, change number"
            onPress={() => Alert.alert('Account', 'Account settings coming soon')}
          />
          <SettingItem
            icon="lock-closed-outline"
            title="Privacy"
            subtitle="Block contacts, disappearing messages"
            onPress={() => Alert.alert('Privacy', 'Privacy settings coming soon')}
          />
          <SettingItem
            icon="happy-outline"
            title="Avatar"
            subtitle="Create, edit, profile photo"
            onPress={() => Alert.alert('Avatar', 'Avatar settings coming soon')}
          />
          <SettingItem
            icon="heart-outline"
            title="Favorites"
            subtitle="Add, reorder, remove"
            onPress={() => Alert.alert('Favorites', 'Favorites coming soon')}
          />
          <SettingItem
            icon="chatbubbles-outline"
            title="Chats"
            subtitle="Theme, wallpapers, chat history"
            onPress={() => Alert.alert('Chats', 'Chat settings coming soon')}
          />
          <SettingItem
            icon="notifications-outline"
            title="Notifications"
            subtitle="Message, group & call tones"
            onPress={() => Alert.alert('Notifications', 'Notification settings coming soon')}
          />
          <SettingItem
            icon="server-outline"
            title="Storage and data"
            subtitle="Network usage, auto-download"
            onPress={() => Alert.alert('Storage', 'Storage settings coming soon')}
          />
          <SettingItem
            icon="accessibility-outline"
            title="Accessibility"
            subtitle="Increase contrast, animation"
            onPress={() => Alert.alert('Accessibility', 'Accessibility settings coming soon')}
          />
          <SettingItem
            icon="globe-outline"
            title="App language"
            subtitle="English (device's language)"
            onPress={() => Alert.alert('Language', 'Language settings coming soon')}
          />
          <SettingItem
            icon="help-circle-outline"
            title="Help"
            subtitle="Help center, contact us, privacy policy"
            onPress={() => Alert.alert('Help', 'Help center coming soon')}
          />
          <SettingItem
            icon="people-outline"
            title="Invite a contact"
            subtitle=""
            onPress={() => Alert.alert('Invite', 'Invite feature coming soon')}
          />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.secondaryText }]}>
            from
          </Text>
          <Text style={[styles.brandText, { color: colors.text }]}>
            CONNEXA
          </Text>
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
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
    height: 56,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    flex: 1,
    marginLeft: 8,
  },
  searchButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileAvatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '400',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 4,
  },
  profileStatus: {
    fontSize: 14,
  },
  qrButton: {
    padding: 8,
  },
  divider: {
    height: 8,
    backgroundColor: '#0B1014',
  },
  settingsList: {
    paddingVertical: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '400',
  },
  settingSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    padding: 32,
  },
  footerText: {
    fontSize: 14,
    marginBottom: 4,
  },
  brandText: {
    fontSize: 16,
    fontWeight: '500',
  },
});