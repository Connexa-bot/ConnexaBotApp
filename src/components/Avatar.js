import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useThemeContext } from '../contexts/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

const Avatar = ({ source, name, size = 50 }) => {
  const { theme } = useThemeContext();
  const styles = getStyles(size);

  if (source) {
    return <Image source={{ uri: source }} style={styles.avatar} />;
  }

  return (
    <View style={[styles.avatar, { backgroundColor: theme.colors.border }]}>
      <MaterialIcons name="person" size={size * 0.7} color={theme.colors.text} />
    </View>
  );
};

const getStyles = (size) =>
  StyleSheet.create({
    avatar: {
      width: size,
      height: size,
      borderRadius: size / 2,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 15,
    },
  });

export default Avatar;