
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
  const { colors, isDark } = useTheme();
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
          styles.fullCard,
          {
            backgroundColor: isDark ? '#000' : '#fff',
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Full screen image */}
        <TouchableOpacity 
          style={styles.imageContainer}
          onPress={onViewFullScreen}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: contact.profilePicUrl || contact.profilePic || 'https://via.placeholder.com/500' }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Bottom action bar */}
        <View style={[styles.bottomActions, { backgroundColor: isDark ? '#1F2C34' : '#fff' }]}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onMessage}
          >
            <View style={[styles.iconCircle, { backgroundColor: isDark ? '#233138' : '#E9EDEF' }]}>
              <Ionicons name="chatbubble" size={24} color="#00A884" />
            </View>
            <Text style={[styles.iconLabel, { color: colors.text }]}>Message</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={onCall}
          >
            <View style={[styles.iconCircle, { backgroundColor: isDark ? '#233138' : '#E9EDEF' }]}>
              <Ionicons name="call" size={24} color="#00A884" />
            </View>
            <Text style={[styles.iconLabel, { color: colors.text }]}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={onInfo}
          >
            <View style={[styles.iconCircle, { backgroundColor: isDark ? '#233138' : '#E9EDEF' }]}>
              <Ionicons name="person-circle" size={24} color="#00A884" />
            </View>
            <Text style={[styles.iconLabel, { color: colors.text }]}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={onClose}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#E53935' }]}>
              <Ionicons name="close-circle" size={24} color="#fff" />
            </View>
            <Text style={[styles.iconLabel, { color: colors.text }]}>Block</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 999,
  },
  fullCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 120,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  iconButton: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconLabel: {
    fontSize: 11,
    fontWeight: '400',
  },
});

export default ProfileCard;
