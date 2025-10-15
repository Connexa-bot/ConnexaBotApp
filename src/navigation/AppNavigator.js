import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import MainTabNavigator from './MainTabNavigator';
import ChatViewScreen from '../screens/ChatViewScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LinkDeviceScreen from '../screens/LinkDeviceScreen';
import ContactsScreen from '../screens/ContactsScreen';
import ContactProfileScreen from '../screens/ContactProfileScreen';
import GroupCreateScreen from '../screens/GroupCreateScreen';
import BroadcastCreateScreen from '../screens/BroadcastCreateScreen';
import StarredMessagesScreen from '../screens/StarredMessagesScreen';
import ChatSettingsScreen from '../screens/ChatSettingsScreen';
import TermsPrivacyScreen from '../screens/TermsPrivacyScreen';
import StatusPostScreen from '../screens/StatusPostScreen';
import SearchScreen from '../screens/SearchScreen';
import CameraScreen from '../screens/CameraScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChatView"
        component={ChatViewScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerShown: true,
          title: 'Settings',
          headerStyle: {
            backgroundColor: colors.header,
          },
          headerTintColor: colors.headerText,
          headerShadowVisible: false,
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
        name="ContactProfile"
        component={ContactProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GroupCreate"
        component={GroupCreateScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BroadcastCreate"
        component={BroadcastCreateScreen}
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
      <Stack.Screen name="Camera" component={CameraScreen} />
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