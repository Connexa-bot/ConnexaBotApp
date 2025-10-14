import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

export default function ChatHeader({ chat, onVideoCall, onVoiceCall, onMore, onSearch }) {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const handleMorePress = () => {
    if (onMore) {
      onMore();
    } else {
      navigation.navigate('ChatSettings', { chat });
    }
  };

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: colors.header,
        paddingTop: insets.top,
      }
    ]}>
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
                {chat.isGroup && <Ionicons name="people" size={24} color="#fff" />}
                {chat.isChannel && <Ionicons name="megaphone" size={24} color="#fff" />}
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
            <Text style={styles.status} numberOfLines={1}>
              {chat.isGroup
                ? `${chat.participantCount || 0} participants`
                : chat.isChannel
                  ? `${chat.subscriberCount || 0} subscribers`
                  : chat.isOnline
                    ? 'online'
                    : chat.lastSeen || 'tap here for contact info'}
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
              <Ionicons name="videocam" size={26} color={colors.headerText} />
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
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    height: 60,
  },
  backButton: {
    padding: 8,
    marginRight: 4,
  },
  chatInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  avatarTextContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 22,
  },
  status: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
});
