import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import MainTabNavigator from './MainTabNavigator';
import ChatViewScreen from '../screens/ChatViewScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LinkDeviceScreen from '../screens/LinkDeviceScreen';
import ContactsScreen from '../screens/ContactsScreen';
import GroupCreateScreen from '../screens/GroupCreateScreen';
import StarredMessagesScreen from '../screens/StarredMessagesScreen';
import ChatSettingsScreen from '../screens/ChatSettingsScreen';
import TermsPrivacyScreen from '../screens/TermsPrivacyScreen';
import StatusPostScreen from '../screens/StatusPostScreen';
import SearchScreen from '../screens/SearchScreen';

const Stack = createNativeStackNavigator();

const HEADER_HEIGHT = Platform.select({
  ios: 100,
  android: 80,
  web: 60
});

export default function AppNavigator() {
  const { colors, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.header,
        },
        headerTintColor: colors.headerText,
        headerShadowVisible: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={({ navigation }) => ({
          title: 'WhatsApp',
          headerStyle: {
            backgroundColor: colors.header,
            height: HEADER_HEIGHT,
          },
          headerTintColor: colors.headerText,
          headerRight: () => (
            <View style={{ flexDirection: 'row', marginRight: 8 }}>
              <TouchableOpacity
                style={{ padding: 8 }}
                onPress={async () => {
                  const { status } = await require('expo-image-picker').requestCameraPermissionsAsync();
                  if (status === 'granted') {
                    const result = await require('expo-image-picker').launchCameraAsync({
                      mediaTypes: require('expo-image-picker').MediaTypeOptions.All,
                      allowsEditing: true,
                      quality: 1,
                    });
                    if (!result.canceled) {
                      navigation.navigate('StatusPost', {
                        mediaUri: result.assets[0].uri,
                        mediaType: result.assets[0].type || 'image',
                      });
                    }
                  }
                }}
              >
                <Ionicons name="camera-outline" size={24} color={colors.headerText} />
              </TouchableOpacity>
              <TouchableOpacity
                style={{ padding: 8, marginLeft: 8 }}
                onPress={() => navigation.navigate('Search')}
              >
                <Ionicons name="search-outline" size={24} color={colors.headerText} />
              </TouchableOpacity>
              <TouchableOpacity
                style={{ padding: 8, marginLeft: 8 }}
                onPress={() => navigation.navigate('Settings')}
              >
                <Ionicons name="ellipsis-vertical" size={24} color={colors.headerText} />
              </TouchableOpacity>
            </View>
          ),
        })}
      />
      <Stack.Screen
        name="ChatView"
        component={ChatViewScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerStyle: {
            backgroundColor: colors.header,
          },
          headerTintColor: colors.headerText,
        }}
      />
      <Stack.Screen
        name="LinkDevice"
        component={LinkDeviceScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TermsPrivacy"
        component={TermsPrivacyScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Contacts"
        component={ContactsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GroupCreate"
        component={GroupCreateScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="StarredMessages"
        component={StarredMessagesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChatSettings"
        component={ChatSettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="StatusPost"
        component={StatusPostScreen}
        options={{ 
          headerShown: false,
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{ 
          headerShown: false,
          animation: 'fade',
        }}
      />
    </Stack.Navigator>
  );
}