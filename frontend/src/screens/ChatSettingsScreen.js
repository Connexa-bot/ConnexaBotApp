
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useWallpaper } from '../contexts/WallpaperContext';
import { useAI } from '../contexts/AIContext';

export default function ChatSettingsScreen({ route }) {
  const { chat } = route.params;
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { getChatWallpaper, setChatWallpaper } = useWallpaper();
  const { getChatSettings, updateChatSettings } = useAI();
  
  const [settings, setSettings] = useState({
    muted: false,
    pinned: false,
    archived: false,
    disappearingMessages: false,
    ...getChatSettings(chat.id)
  });

  const updateSetting = async (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    await updateChatSettings(chat.id, { [key]: value });
  };

  const handleClearChat = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear all messages?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => {
          // API call to clear chat
        }}
      ]
    );
  };

  const handleDeleteChat = () => {
    Alert.alert(
      'Delete Chat',
      'Are you sure you want to delete this chat?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          // API call to delete chat
          navigation.goBack();
        }}
      ]
    );
  };

  const handleBlockContact = () => {
    Alert.alert(
      'Block Contact',
      'Are you sure you want to block this contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Block', style: 'destructive', onPress: () => {
          // API call to block contact
        }}
      ]
    );
  };

  const SettingRow = ({ icon, title, value, onToggle, danger }) => (
    <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={24} color={danger ? '#F44336' : colors.icon} />
        <Text style={[styles.settingTitle, { color: danger ? '#F44336' : colors.text }]}>
          {title}
        </Text>
      </View>
      {onToggle && (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primary }}
        />
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.header }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat Settings</Text>
      </View>

      <ScrollView>
        <View style={styles.profileSection}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {chat.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.chatName, { color: colors.text }]}>{chat.name}</Text>
          <Text style={[styles.chatStatus, { color: colors.secondaryText }]}>
            {chat.isOnline ? 'online' : chat.lastSeen || 'offline'}
          </Text>
        </View>

        <View style={styles.section}>
          <SettingRow
            icon="notifications-off-outline"
            title="Mute notifications"
            value={settings.muted}
            onToggle={(val) => updateSetting('muted', val)}
          />
          <SettingRow
            icon="pin-outline"
            title="Pin chat"
            value={settings.pinned}
            onToggle={(val) => updateSetting('pinned', val)}
          />
          <SettingRow
            icon="archive-outline"
            title="Archive chat"
            value={settings.archived}
            onToggle={(val) => updateSetting('archived', val)}
          />
          <SettingRow
            icon="time-outline"
            title="Disappearing messages"
            value={settings.disappearingMessages}
            onToggle={(val) => updateSetting('disappearingMessages', val)}
          />
        </View>

        <View style={styles.section}>
          <TouchableOpacity onPress={() => navigation.navigate('StarredMessages')}>
            <SettingRow icon="star-outline" title="Starred messages" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleClearChat}>
            <SettingRow icon="trash-outline" title="Clear chat" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity onPress={handleBlockContact}>
            <SettingRow icon="ban-outline" title="Block contact" danger />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteChat}>
            <SettingRow icon="trash-outline" title="Delete chat" danger />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 16,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '600' },
  chatName: { fontSize: 24, fontWeight: '600', marginBottom: 4 },
  chatStatus: { fontSize: 14 },
  section: { marginTop: 16 },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 0.5,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    marginLeft: 16,
  },
});
