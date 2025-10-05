import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useThemeContext } from '../contexts/ThemeContext';

const chats = [
  { id: '1', name: 'John Doe', message: 'Hey, how are you?', time: '3:45 PM' },
  { id: '2', name: 'Jane Smith', message: 'See you tomorrow!', time: '1:23 PM' },
];

export default function ChatsScreen() {
  const { theme } = useThemeContext();

  const renderItem = ({ item }) => (
    <View style={[styles.chatItem, { borderBottomColor: theme.colors.border }]}>
      <View style={styles.chatContent}>
        <Text style={[styles.chatName, { color: theme.colors.text }]}>{item.name}</Text>
        <Text style={[styles.chatMessage, { color: theme.colors.text }]}>{item.message}</Text>
      </View>
      <Text style={[styles.chatTime, { color: theme.colors.text }]}>{item.time}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={chats}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
  },
  chatContent: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatMessage: {
    fontSize: 14,
    marginTop: 2,
  },
  chatTime: {
    fontSize: 12,
  },
});