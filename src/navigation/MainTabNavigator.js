
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import ChatsScreen from '../screens/ChatsScreen';
import UpdatesScreen from '../screens/UpdatesScreen';
import CallsScreen from '../screens/CallsScreen';

const Tab = createBottomTabNavigator();

function CustomHeader({ title }) {
  const { colors } = useTheme();
  const navigation = useNavigation();

  return (
    <View style={{
      backgroundColor: colors.header,
      paddingTop: Platform.OS === 'ios' ? 50 : 10,
      paddingBottom: 10,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <Text style={{
        color: colors.headerText,
        fontSize: 20,
        fontWeight: '500',
      }}>{title}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
        <TouchableOpacity
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
        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
          <Ionicons name="search-outline" size={24} color={colors.headerText} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="ellipsis-vertical" size={24} color={colors.headerText} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function MainTabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Chats"
      screenOptions={({ route }) => ({
        header: () => <CustomHeader title={route.name} />,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 8,
          elevation: 0,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarHideOnKeyboard: Platform.OS === 'android',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Chats') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Updates') {
            iconName = focused ? 'radio-button-on' : 'radio-button-off';
          } else if (route.name === 'Calls') {
            iconName = focused ? 'call' : 'call-outline';
          } else if (route.name === 'Tools') {
            iconName = focused ? 'apps' : 'apps-outline';
          }

          return <Ionicons name={iconName} size={24} color={color} />;
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
  );
}
