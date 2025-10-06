import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../contexts/ThemeContext';

export default function CustomHeader({ title }) {
    const { theme } = useThemeContext();

  return (
    <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerIcons}>
        <Ionicons name="search" size={24} color="white" />
        <Ionicons name="ellipsis-vertical" size={24} color="white" style={{ marginLeft: 15 }}/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
  },
});