import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { performProfileAction } from '../services/api';
import Avatar from '../components/Avatar';
import { useThemeContext } from '../contexts/ThemeContext';

export default function SettingsScreen() {
  const { user, isConnected } = useAuth();
  const { mode, setMode } = useThemeContext();
  const phone = user?.phone;

  const [name, setName] = useState(user?.name || 'User');
  const [status, setStatus] = useState('Hey there! I am using ConnexaBot.');
  const [avatarUri, setAvatarUri] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateProfile = async (action, value) => {
    if (!isConnected) {
      Alert.alert('Error', 'Not connected to the server.');
      return;
    }
    setIsSaving(true);
    try {
      const payload = { phone, action, jid: `${phone}@s.whatsapp.net` };
      if (action === 'updateName') {
        payload.name = value;
      } else if (action === 'updateStatus') {
        payload.status = value;
      } else if (action === 'updatePicture') {
        payload.imageBuffer = value;
      }

      await performProfileAction(payload);
      Alert.alert('Success', `Profile ${action.replace('update', '')} updated!`);
    } catch (err) {
      Alert.alert('Error', `Failed to update profile. ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Denied", "You've refused to allow this app to access your photos!");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (pickerResult.canceled) {
      return;
    }

    if (pickerResult.assets && pickerResult.assets.length > 0) {
      const asset = pickerResult.assets[0];
      setAvatarUri(asset.uri); // Optimistic UI update
      await handleUpdateProfile('updatePicture', asset.base64);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileSection}>
        <Avatar name={name} source={{ uri: avatarUri }} size={100} />
        <TouchableOpacity style={styles.editAvatarButton} onPress={handlePickImage}>
          <Text style={styles.editAvatarText}>Edit</Text>
        </TouchableOpacity>
        <Text style={styles.userName}>{name}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your Name"
          />
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => handleUpdateProfile('updateName', name)}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>About (Status)</Text>
          <TextInput
            style={styles.input}
            value={status}
            onChangeText={setStatus}
            placeholder="Your Status"
          />
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => handleUpdateProfile('updateStatus', status)}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Theme</Text>
        <TouchableOpacity style={styles.option} onPress={() => setMode('light')}>
          <Text style={styles.optionText}>🌞 Light Mode</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={() => setMode('dark')}>
          <Text style={styles.optionText}>🌙 Dark Mode</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={() => setMode('system')}>
          <Text style={styles.optionText}>⚡ System Default</Text>
        </TouchableOpacity>
        <Text style={styles.currentTheme}>Current: {mode}</Text>
      </View>

      {isSaving && <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#00A884" />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111B21',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(134, 150, 160, 0.15)',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 30,
    right: '35%',
    backgroundColor: '#00A884',
    padding: 8,
    borderRadius: 15,
  },
  editAvatarText: {
    color: '#FFF',
    fontSize: 12,
  },
  userName: {
    marginTop: 15,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E9EDEF',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00A884',
    marginBottom: 15,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#8696A0',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#202C33',
    color: '#E9EDEF',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#00A884',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#111B21',
    fontWeight: 'bold',
  },
  option: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: 'rgba(134, 150, 160, 0.15)',
  },
  optionText: {
    fontSize: 16,
    color: '#E9EDEF',
  },
  currentTheme: {
    marginTop: 15,
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
  },
});