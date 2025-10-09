import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

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

  const SettingItem = ({ icon, title, subtitle, onPress, rightElement }) => (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: colors.border }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Ionicons name={icon} size={24} color={colors.icon} style={styles.settingIcon} />
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: colors.secondaryText }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement || (
        <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.profileSection, { borderBottomColor: colors.border }]}>
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
            {/* ENDPOINT NEEDED: GET /api/profile/:phone - Returns user profile info */}
            Hey there! I am using WhatsApp
          </Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="qr-code-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <SettingItem
          icon="key-outline"
          title="Account"
          subtitle="Security notifications, change number"
          onPress={() => {}}
        />
        <SettingItem
          icon="lock-closed-outline"
          title="Privacy"
          subtitle="Block contacts, disappearing messages"
          onPress={() => {}}
        />
        <SettingItem
          icon="person-outline"
          title="Avatar"
          subtitle="Create, edit, profile photo"
          onPress={() => {}}
        />
        <SettingItem
          icon="chatbubbles-outline"
          title="Chats"
          subtitle="Theme, wallpapers, chat history"
          onPress={() => {}}
        />
        <SettingItem
          icon="notifications-outline"
          title="Notifications"
          subtitle="Message, group & call tones"
          onPress={() => setNotificationsEnabled(!notificationsEnabled)}
          rightElement={
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          }
        />
        <SettingItem
          icon="analytics-outline"
          title="Storage and data"
          subtitle="Network usage, auto-download"
          onPress={() => {}}
        />
      </View>

      <View style={styles.section}>
        <SettingItem
          icon="moon-outline"
          title="Dark Mode"
          subtitle={isDark ? 'On' : 'Off'}
          onPress={toggleTheme}
          rightElement={
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          }
        />
      </View>

      <View style={styles.section}>
        <SettingItem
          icon="help-circle-outline"
          title="Help"
          subtitle="Help center, contact us, privacy policy"
          onPress={() => {}}
        />
        <SettingItem
          icon="people-outline"
          title="Invite a friend"
          onPress={() => {}}
        />
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: '#F44336' }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#F44336" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.secondaryText }]}>
          WhatsApp Clone v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileAvatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileStatus: {
    fontSize: 14,
  },
  section: {
    marginTop: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingIcon: {
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  logoutText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    padding: 20,
  },
  footerText: {
    fontSize: 12,
  },
});
