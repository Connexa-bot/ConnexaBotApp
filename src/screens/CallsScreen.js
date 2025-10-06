import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeContext } from '../contexts/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

export default function CallsScreen() {
  const { theme } = useThemeContext();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <MaterialIcons name="history" size={48} color={theme.colors.text} />
      <Text style={[styles.text, { color: theme.colors.text }]}>Call history is not yet available.</Text>
      <Text style={[styles.subText, { color: theme.colors.text }]}>This feature is coming soon.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  }
});