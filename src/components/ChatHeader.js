import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ChatHeader({ chat, onVideoCall, onVoiceCall, onScroll }) {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [isExpanded, setIsExpanded] = useState(false);
  const expandAnim = useRef(new Animated.Value(0)).current;
  const profileScaleAnim = useRef(new Animated.Value(0)).current;
  const profileTranslateAnim = useRef(new Animated.Value(0)).current;

  const HEADER_HEIGHT = 60;
  const EXPANDED_HEIGHT = 350;

  const toggleExpand = () => {
    const toValue = isExpanded ? 0 : 1;
    setIsExpanded(!isExpanded);

    Animated.parallel([
      Animated.spring(expandAnim, {
        toValue,
        useNativeDriver: false,
        tension: 50,
        friction: 7,
      }),
      Animated.spring(profileScaleAnim, {
        toValue,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
    ]).start();
  };

  const headerHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [HEADER_HEIGHT, EXPANDED_HEIGHT],
  });

  const profileSize = profileScaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [36, 140],
  });

  const profileTranslateX = profileScaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCREEN_WIDTH / 2 - 70],
  });

  const profileTranslateY = profileScaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 60],
  });

  const nameOpacity = expandAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  const expandedContentOpacity = expandAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.header,
          paddingTop: insets.top,
          height: headerHeight,
        },
      ]}
    >
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.headerText} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.chatInfo}
          onPress={toggleExpand}
          activeOpacity={0.7}
        >
          <Animated.View
            style={{
              transform: [
                { translateX: profileTranslateX },
                { translateY: profileTranslateY },
              ],
            }}
          >
            <Animated.Image
              source={{ uri: chat.profilePic || 'https://via.placeholder.com/140' }}
              style={[
                styles.avatar,
                {
                  width: profileSize,
                  height: profileSize,
                  borderRadius: profileSize,
                },
              ]}
            />
          </Animated.View>

          <Animated.View style={[styles.details, { opacity: nameOpacity }]}>
            <Text style={[styles.name, { color: colors.headerText }]} numberOfLines={1}>
              {chat.name || chat.id}
            </Text>
            <Text style={[styles.status, { color: colors.headerText, opacity: 0.7 }]} numberOfLines={1}>
              {chat.isOnline ? 'online' : chat.lastSeen ? `last seen ${chat.lastSeen}` : 'tap here for contact info'}
            </Text>
          </Animated.View>
        </TouchableOpacity>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={onVideoCall}>
            <Ionicons name="videocam" size={24} color={colors.headerText} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={onVoiceCall}>
            <Ionicons name="call" size={24} color={colors.headerText} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="ellipsis-vertical" size={24} color={colors.headerText} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Expanded profile content */}
      <Animated.View
        style={[
          styles.expandedContent,
          {
            opacity: expandedContentOpacity,
            backgroundColor: colors.header,
          },
        ]}
        pointerEvents={isExpanded ? 'auto' : 'none'}
      >
        <Text style={[styles.expandedName, { color: colors.headerText }]}>
          {chat.name || chat.id}
        </Text>
        {chat.phone && (
          <Text style={[styles.expandedPhone, { color: colors.headerText, opacity: 0.7 }]}>
            {chat.phone}
          </Text>
        )}
        {chat.about && (
          <Text style={[styles.expandedAbout, { color: colors.headerText, opacity: 0.7 }]}>
            {chat.about}
          </Text>
        )}
        <View style={styles.mediaInfo}>
          <View style={styles.mediaItem}>
            <Text style={[styles.mediaCount, { color: colors.headerText }]}>
              {chat.mediaCount || 0}
            </Text>
            <Text style={[styles.mediaLabel, { color: colors.headerText, opacity: 0.7 }]}>
              Media
            </Text>
          </View>
          <View style={styles.mediaItem}>
            <Text style={[styles.mediaCount, { color: colors.headerText }]}>
              {chat.linksCount || 0}
            </Text>
            <Text style={[styles.mediaLabel, { color: colors.headerText, opacity: 0.7 }]}>
              Links
            </Text>
          </View>
          <View style={styles.mediaItem}>
            <Text style={[styles.mediaCount, { color: colors.headerText }]}>
              {chat.docsCount || 0}
            </Text>
            <Text style={[styles.mediaLabel, { color: colors.headerText, opacity: 0.7 }]}>
              Docs
            </Text>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
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
    marginRight: 12,
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
  expandedContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 200,
    paddingBottom: 20,
    alignItems: 'center',
  },
  expandedName: {
    fontSize: 22,
    fontWeight: '500',
    marginBottom: 4,
  },
  expandedPhone: {
    fontSize: 15,
    marginBottom: 8,
  },
  expandedAbout: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  mediaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 40,
  },
  mediaItem: {
    alignItems: 'center',
  },
  mediaCount: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
  mediaLabel: {
    fontSize: 12,
  },
});