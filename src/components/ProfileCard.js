
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ProfileCard = ({ visible, contact, onClose, onMessage, onCall, onVideoCall, onInfo, onViewFullScreen }) => {
  const { colors } = useTheme();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible && slideAnim._value === SCREEN_HEIGHT) {
    return null;
  }

  return (
    <>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropAnim,
            },
          ]}
        />
      </TouchableWithoutFeedback>
      
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: colors.modalBackground,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onViewFullScreen} activeOpacity={0.9}>
            <Image
              source={{ uri: contact.profilePic || 'https://via.placeholder.com/120' }}
              style={styles.profilePic}
            />
          </TouchableOpacity>
          <Text style={[styles.name, { color: colors.text }]}>{contact.name || contact.id}</Text>
          {contact.phone && (
            <Text style={[styles.phone, { color: colors.secondaryText }]}>{contact.phone}</Text>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.secondaryBackground }]}
            onPress={onMessage}
          >
            <Ionicons name="chatbubble" size={24} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>Message</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.secondaryBackground }]}
            onPress={onCall}
          >
            <Ionicons name="call" size={24} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.secondaryBackground }]}
            onPress={onVideoCall}
          >
            <Ionicons name="videocam" size={24} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>Video</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.secondaryBackground }]}
            onPress={onInfo}
          >
            <Ionicons name="information-circle" size={24} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>Info</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  card: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 24,
    paddingBottom: 40,
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 4,
  },
  phone: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  actionButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    minWidth: 70,
  },
  actionText: {
    fontSize: 12,
    marginTop: 8,
  },
});

export default ProfileCard;
