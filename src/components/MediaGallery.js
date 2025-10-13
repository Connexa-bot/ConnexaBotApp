
import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');
const ITEM_SIZE = width / 3 - 4;

export default function MediaGallery({ media, onMediaPress }) {
  const { colors } = useTheme();

  const renderMediaItem = ({ item }) => (
    <TouchableOpacity
      style={styles.mediaItem}
      onPress={() => onMediaPress(item)}
    >
      {item.type === 'image' ? (
        <Image source={{ uri: item.url }} style={styles.mediaImage} />
      ) : item.type === 'video' ? (
        <View style={styles.videoContainer}>
          <Image source={{ uri: item.thumbnail }} style={styles.mediaImage} />
          <View style={styles.playIcon}>
            <Ionicons name="play" size={32} color="#fff" />
          </View>
        </View>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={media}
      renderItem={renderMediaItem}
      keyExtractor={(item) => item.id}
      numColumns={3}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 2,
  },
  mediaItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: 2,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  videoContainer: {
    position: 'relative',
  },
  playIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -16 }, { translateY: -16 }],
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
