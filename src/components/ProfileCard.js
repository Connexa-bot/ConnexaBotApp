
import React, { useEffect, useRef, useState } from 'react';
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
  const [showFullScreen, setShowFullScreen] = useState(false);
  const fullScreenAnim = useRef(new Animated.Value(0)).current;

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
      setShowFullScreen(false);
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

  const handleImagePress = () => {
    setShowFullScreen(true);
    Animated.spring(fullScreenAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  };

  const handleBackFromFullScreen = () => {
    Animated.timing(fullScreenAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowFullScreen(false);
    });
  };

  if (!visible && slideAnim._value === SCREEN_HEIGHT) {
    return null;
  }

  const cardScale = fullScreenAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  const cardTranslateY = fullScreenAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -100],
  });

  const actionsOpacity = fullScreenAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  const backButtonOpacity = fullScreenAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <>
      <TouchableWithoutFeedback onPress={showFullScreen ? handleBackFromFullScreen : onClose}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropAnim,
              backgroundColor: showFullScreen ? '#000' : 'rgba(0, 0, 0, 0.5)',
            },
          ]}
        />
      </TouchableWithoutFeedback>
      
      <Animated.View
        style={[
          styles.cardContainer,
          {
            backgroundColor: isDark ? '#0B141A' : '#fff',
            transform: [
              { translateY: slideAnim },
              { scale: cardScale },
              { translateY: cardTranslateY },
            ],
          },
        ]}
      >
        {/* Back button for fullscreen */}
        <Animated.View
          style={[
            styles.backButton,
            {
              opacity: backButtonOpacity,
            },
          ]}
          pointerEvents={showFullScreen ? 'auto' : 'none'}
        >
          <TouchableOpacity
            onPress={handleBackFromFullScreen}
            style={styles.backButtonTouchable}
          >
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
        </Animated.View>

        {/* Profile Image - fills entire card */}
        <TouchableOpacity 
          style={styles.imageContainer}
          onPress={showFullScreen ? handleBackFromFullScreen : handleImagePress}
          activeOpacity={0.9}
        >
          {contact.profilePicUrl || contact.profilePic ? (
            <Image
              source={{ uri: contact.profilePicUrl || contact.profilePic }}
              style={styles.fullImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.placeholderContainer, { backgroundColor: colors.primary }]}>
              <Text style={styles.placeholderText}>
                {contact.name?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Bottom action bar */}
        <Animated.View
          style={[
            styles.bottomActions,
            {
              backgroundColor: isDark ? 'rgba(31, 44, 52, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              opacity: actionsOpacity,
            },
          ]}
          pointerEvents={showFullScreen ? 'none' : 'auto'}
        >
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              onMessage();
              onClose();
            }}
          >
            <View style={[styles.iconCircle, { backgroundColor: isDark ? '#233138' : '#E9EDEF' }]}>
              <Ionicons name="chatbubble" size={24} color="#00A884" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              onCall();
              onClose();
            }}
          >
            <View style={[styles.iconCircle, { backgroundColor: isDark ? '#233138' : '#E9EDEF' }]}>
              <Ionicons name="person-circle" size={24} color="#00A884" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              onInfo();
              onClose();
            }}
          >
            <View style={[styles.iconCircle, { backgroundColor: isDark ? '#233138' : '#E9EDEF' }]}>
              <Ionicons name="information-circle" size={24} color="#00A884" />
            </View>
          </TouchableOpacity>
        </Animated.View>
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
    zIndex: 999,
  },
  cardContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.7,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    zIndex: 1000,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backButtonTouchable: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#FFFFFF',
    fontSize: 80,
    fontWeight: '400',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
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
  },
});

export default ProfileCard;
