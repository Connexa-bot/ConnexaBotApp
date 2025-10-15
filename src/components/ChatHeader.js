
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Modal, TouchableWithoutFeedback, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

export default function ChatHeader({ chat, onVideoCall, onVoiceCall, onMore, onSearch }) {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [showMenu, setShowMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const handleMorePress = () => {
    setShowMenu(true);
  };

  const handleMenuOptionPress = (option) => {
    setShowMenu(false);
    setShowMoreMenu(false);

    switch (option) {
      case 'report':
        Alert.alert('Report', 'Report this contact to WhatsApp?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Report', style: 'destructive', onPress: () => console.log('Reported') }
        ]);
        break;
      case 'block':
        Alert.alert('Block Contact', 'Block this contact?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Block', style: 'destructive', onPress: () => console.log('Blocked') }
        ]);
        break;
      case 'clear':
        Alert.alert('Clear Chat', 'Delete all messages in this chat?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Clear', style: 'destructive', onPress: () => console.log('Chat cleared') }
        ]);
        break;
      case 'export':
        Alert.alert('Export Chat', 'Export chat history?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Export', onPress: () => console.log('Chat exported') }
        ]);
        break;
      case 'shortcut':
        Alert.alert('Add Shortcut', 'Add shortcut to home screen?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add', onPress: () => console.log('Shortcut added') }
        ]);
        break;
      case 'list':
        Alert.alert('Add to List', 'Create or add to a list', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add', onPress: () => console.log('Added to list') }
        ]);
        break;
      case 'more':
        setShowMoreMenu(true);
        break;
      case 'contacts':
        Alert.alert('Add to Contacts', 'Add this person to your contacts?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add', onPress: () => console.log('Added to contacts') }
        ]);
        break;
      case 'search':
        navigation.navigate('Search');
        break;
      case 'group':
        navigation.navigate('GroupCreate');
        break;
      case 'media':
        Alert.alert('Media, Links, and Docs', 'View media, links, and documents from this chat');
        break;
      case 'mute':
        Alert.alert('Mute Notifications', 'Mute notifications for:', [
          { text: 'Cancel', style: 'cancel' },
          { text: '8 hours', onPress: () => console.log('Muted for 8 hours') },
          { text: '1 week', onPress: () => console.log('Muted for 1 week') },
          { text: 'Always', onPress: () => console.log('Muted always') }
        ]);
        break;
      case 'disappearing':
        Alert.alert('Disappearing Messages', 'Set messages to disappear after:', [
          { text: 'Cancel', style: 'cancel' },
          { text: '24 hours', onPress: () => console.log('24 hours') },
          { text: '7 days', onPress: () => console.log('7 days') },
          { text: '90 days', onPress: () => console.log('90 days') }
        ]);
        break;
      case 'theme':
        navigation.navigate('ChatSettings', { chat });
        break;
    }
  };

  const renderMenu = () => (
    <Modal
      visible={showMenu}
      transparent
      animationType="fade"
      onRequestClose={() => setShowMenu(false)}
    >
      <TouchableWithoutFeedback onPress={() => setShowMenu(false)}>
        <View style={styles.menuOverlay}>
          <View style={[styles.menuContainer, { backgroundColor: colors.modalBackground, top: insets.top + 60, right: 8 }]}>
            <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.divider }]} onPress={() => handleMenuOptionPress('report')}>
              <Text style={[styles.menuText, { color: colors.text }]}>Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.divider }]} onPress={() => handleMenuOptionPress('block')}>
              <Text style={[styles.menuText, { color: colors.text }]}>Block</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.divider }]} onPress={() => handleMenuOptionPress('clear')}>
              <Text style={[styles.menuText, { color: colors.text }]}>Clear chat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.divider }]} onPress={() => handleMenuOptionPress('export')}>
              <Text style={[styles.menuText, { color: colors.text }]}>Export chat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.divider }]} onPress={() => handleMenuOptionPress('shortcut')}>
              <Text style={[styles.menuText, { color: colors.text }]}>Add shortcut</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.divider }]} onPress={() => handleMenuOptionPress('list')}>
              <Text style={[styles.menuText, { color: colors.text }]}>Add to list</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOptionPress('more')}>
              <Text style={[styles.menuText, { color: colors.text }]}>More</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const renderMoreMenu = () => (
    <Modal
      visible={showMoreMenu}
      transparent
      animationType="fade"
      onRequestClose={() => setShowMoreMenu(false)}
    >
      <TouchableWithoutFeedback onPress={() => setShowMoreMenu(false)}>
        <View style={styles.menuOverlay}>
          <View style={[styles.menuContainer, { backgroundColor: colors.modalBackground, top: insets.top + 60, right: 8 }]}>
            <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.divider }]} onPress={() => handleMenuOptionPress('contacts')}>
              <Text style={[styles.menuText, { color: colors.text }]}>Add to contacts</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.divider }]} onPress={() => handleMenuOptionPress('search')}>
              <Text style={[styles.menuText, { color: colors.text }]}>Search</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.divider }]} onPress={() => handleMenuOptionPress('group')}>
              <Text style={[styles.menuText, { color: colors.text }]}>New group</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.divider }]} onPress={() => handleMenuOptionPress('media')}>
              <Text style={[styles.menuText, { color: colors.text }]}>Media, links, and docs</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.divider }]} onPress={() => handleMenuOptionPress('mute')}>
              <Text style={[styles.menuText, { color: colors.text }]}>Mute notifications</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.divider }]} onPress={() => handleMenuOptionPress('disappearing')}>
              <Text style={[styles.menuText, { color: colors.text }]}>Disappearing messages</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOptionPress('theme')}>
              <Text style={[styles.menuText, { color: colors.text }]}>Chat theme</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: colors.header,
        paddingTop: insets.top,
      }
    ]}>
      {renderMenu()}
      {renderMoreMenu()}
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.headerText} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.chatInfo}
          onPress={handleMorePress}
          activeOpacity={0.7}
        >
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            {chat.profilePic ? (
              <Image source={{ uri: chat.profilePic }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarTextContainer}>
                {chat.isGroup && <Ionicons name="people" size={20} color="#fff" />}
                {chat.isChannel && <Ionicons name="megaphone" size={20} color="#fff" />}
                {!chat.isGroup && !chat.isChannel && (
                  <Text style={styles.avatarText}>
                    {chat.name?.charAt(0).toUpperCase() || '?'}
                  </Text>
                )}
              </View>
            )}
          </View>

          <View style={styles.details}>
            <Text style={[styles.name, { color: colors.headerText }]} numberOfLines={1}>
              {chat.name || chat.id}
            </Text>
            <Text style={[styles.status, { color: colors.headerText, opacity: 0.7 }]} numberOfLines={1}>
              {chat.isGroup
                ? `${chat.participantCount || 0} participants`
                : chat.isChannel
                  ? `${chat.subscriberCount || 0} subscribers`
                  : 'tap here for contact info'}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.actions}>
          {onVideoCall && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onVideoCall}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="videocam" size={24} color={colors.headerText} />
            </TouchableOpacity>
          )}

          {onVoiceCall && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onVoiceCall}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="call" size={24} color={colors.headerText} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleMorePress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="ellipsis-vertical" size={24} color={colors.headerText} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  menuOverlay: {
    flex: 1,
  },
  menuContainer: {
    position: 'absolute',
    borderRadius: 8,
    minWidth: 200,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  menuText: {
    fontSize: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    height: 60,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  chatInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarTextContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 20,
  },
  status: {
    fontSize: 13,
    lineHeight: 16,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  actionButton: {
    padding: 4,
  },
});
