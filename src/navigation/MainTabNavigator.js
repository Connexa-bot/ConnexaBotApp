import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import ChatsScreen from '../screens/ChatsScreen';
import UpdatesScreen from '../screens/UpdatesScreen';
import CallsScreen from '../screens/CallsScreen';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Chats"
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabIconDefault,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.divider,
          borderTopWidth: 0.5,
          height: Platform.OS === 'ios' ? 85 : 60,
          paddingBottom: Platform.OS === 'ios' ? 25 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Chats') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Updates') {
            iconName = focused ? 'sync-circle' : 'sync-circle-outline';
          } else if (route.name === 'Calls') {
            iconName = focused ? 'call' : 'call-outline';
          } else if (route.name === 'Communities') {
            iconName = focused ? 'people' : 'people-outline';
          }
          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBarHideOnKeyboard: Platform.OS === 'android',
      })}
    >
      <Tab.Screen 
        name="Chats" 
        component={ChatsScreen}
        options={{
          tabBarLabel: 'Chats',
          tabBarBadge: null,
        }}
      />
      <Tab.Screen 
        name="Updates" 
        component={UpdatesScreen}
        options={{
          tabBarLabel: 'Updates',
        }}
      />
      <Tab.Screen 
        name="Calls" 
        component={CallsScreen}
        options={{
          tabBarLabel: 'Calls',
        }}
      />
    </Tab.Navigator>
  );
}
