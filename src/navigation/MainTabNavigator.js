import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import ChatsScreen from '../screens/ChatsScreen';
import UpdatesScreen from '../screens/UpdatesScreen';
import CallsScreen from '../screens/CallsScreen';
import CommunitiesScreen from '../screens/CommunitiesScreen';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Tab = createMaterialTopTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Chats"
      screenOptions={{
        tabBarActiveTintColor: '#00A884',
        tabBarInactiveTintColor: '#8696A0',
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: 'bold',
          textTransform: 'none', // Prevent uppercase labels
        },
        tabBarStyle: {
          backgroundColor: '#1F2C34',
        },
        tabBarIndicatorStyle: {
          backgroundColor: '#00A884',
          height: 3,
        },
      }}
    >
      <Tab.Screen
        name="Communities"
        component={CommunitiesScreen}
        options={{
          tabBarShowLabel: false,
          tabBarShowIcon: true,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account-group" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatsScreen}
        options={{
          tabBarShowIcon: false,
          tabBarLabel: 'Chats',
        }}
      />
      <Tab.Screen
        name="Updates"
        component={UpdatesScreen}
        options={{
          tabBarShowIcon: false,
          tabBarLabel: 'Updates',
        }}
      />
      <Tab.Screen
        name="Calls"
        component={CallsScreen}
        options={{
          tabBarShowIcon: false,
          tabBarLabel: 'Calls',
        }}
      />
    </Tab.Navigator>
  );
}