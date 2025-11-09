
import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function SearchBar({ onSearch, onClose, placeholder = 'Search...' }) {
  const [query, setQuery] = useState('');
  const { colors } = useTheme();
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSearch = (text) => {
    setQuery(text);
    onSearch(text);
  };

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: colors.header, opacity: slideAnim }
      ]}
    >
      <TouchableOpacity onPress={handleClose}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      
      <TextInput
        style={[styles.input, { color: '#fff' }]}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.6)"
        value={query}
        onChangeText={handleSearch}
        autoFocus
      />
      
      {query.length > 0 && (
        <TouchableOpacity onPress={() => handleSearch('')}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingTop: 48,
  },
  input: {
    flex: 1,
    fontSize: 18,
    marginHorizontal: 16,
  },
});
