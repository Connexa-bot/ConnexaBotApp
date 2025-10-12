import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import ChatsScreen from '../screens/ChatsScreen';
import UpdatesScreen from '../screens/UpdatesScreen';
import CallsScreen from '../screens/CallsScreen';

const Tab = createMaterialTopTabNavigator();

export default function MainTabNavigator() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        initialRouteName="Chats"
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
          tabBarIndicatorStyle: {
            backgroundColor: '#FFFFFF',
            height: 3,
          },
          tabBarStyle: {
            backgroundColor: colors.header,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: '600',
            textTransform: 'none',
            letterSpacing: 0.5,
          },
          tabBarItemStyle: {
            flexDirection: 'row',
            alignItems: 'center',
          },
          tabBarPressColor: 'rgba(255, 255, 255, 0.1)',
          swipeEnabled: true,
          animationEnabled: true,
          lazy: false,
          lazyPreloadDistance: 1,
          tabBarIcon: ({ focused, color }) => {
            let iconName;
            if (route.name === 'Chats') {
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            } else if (route.name === 'Updates') {
              iconName = focused ? 'sync-circle' : 'sync-circle-outline';
            } else if (route.name === 'Calls') {
              iconName = focused ? 'call' : 'call-outline';
            }
            return (
              <Ionicons 
                name={iconName} 
                size={20} 
                color={color}
                style={{ marginRight: Platform.OS === 'web' ? 4 : 0 }}
              />
            );
          },
        })}
      >
        <Tab.Screen 
          name="Chats" 
          component={ChatsScreen}
          options={{
            tabBarLabel: 'Chats',
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
    </View>
  );
}
