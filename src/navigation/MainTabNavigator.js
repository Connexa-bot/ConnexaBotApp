
import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import ChatsScreen from '../screens/ChatsScreen';
import UpdatesScreen from '../screens/UpdatesScreen';
import CommunitiesScreen from '../screens/CommunitiesScreen';
import CallsScreen from '../screens/CallsScreen';
import MenuModal from '../components/MenuModal';

const Tab = createBottomTabNavigator();

function CustomHeader({ title }) {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [menuVisible, setMenuVisible] = useState(false);

  const handleMorePress = () => {
    let options = [];
    
    if (title === 'Chats') {
      options = [
        { label: 'New group', action: () => {} },
        { label: 'New broadcast', action: () => {} },
        { label: 'Linked devices', action: () => {} },
        { label: 'Starred messages', action: () => {} },
        { label: 'Settings', action: () => navigation.navigate('Settings') },
      ];
    } else if (title === 'Updates') {
      options = [
        { label: 'Status privacy', action: () => {} },
        { label: 'Settings', action: () => navigation.navigate('Settings') },
      ];
    } else if (title === 'Calls') {
      options = [
        { label: 'Clear call log', action: () => {} },
        { label: 'Settings', action: () => navigation.navigate('Settings') },
      ];
    }

    if (Platform.OS === 'ios') {
      const { ActionSheetIOS } = require('react-native');
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...options.map(o => o.label), 'Cancel'],
          cancelButtonIndex: options.length,
        },
        (buttonIndex) => {
          if (buttonIndex < options.length) {
            options[buttonIndex].action();
          }
        }
      );
    } else {
      setMenuVisible(true);
    }
  };

  const getMenuOptions = () => {
    if (title === 'Chats') {
      return [
        { label: 'New group', action: () => {} },
        { label: 'New broadcast', action: () => {} },
        { label: 'Linked devices', action: () => {} },
        { label: 'Starred messages', action: () => {} },
        { label: 'Settings', action: () => navigation.navigate('Settings') },
      ];
    } else if (title === 'Updates') {
      return [
        { label: 'Status privacy', action: () => {} },
        { label: 'Settings', action: () => navigation.navigate('Settings') },
      ];
    } else if (title === 'Communities') {
      return [
        { label: 'Settings', action: () => navigation.navigate('Settings') },
      ];
    } else if (title === 'Calls') {
      return [
        { label: 'Clear call log', action: () => {} },
        { label: 'Settings', action: () => navigation.navigate('Settings') },
      ];
    }
    return [];
  };

  const handleCameraPress = async () => {
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
  };

  return (
    <>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.header}
        translucent={false}
      />
      <View style={{
        backgroundColor: colors.header,
        paddingTop: insets.top,
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
        {title === 'Chats' && (
          <TouchableOpacity onPress={handleCameraPress}>
            <Ionicons name="camera-outline" size={24} color={colors.headerText} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleMorePress}>
          <Ionicons name="ellipsis-vertical" size={24} color={colors.headerText} />
        </TouchableOpacity>
      </View>
    </View>
    <MenuModal
      visible={menuVisible}
      onClose={() => setMenuVisible(false)}
      options={getMenuOptions()}
    />
    </>
  );
}

export default function MainTabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Chats"
      screenOptions={({ route }) => ({
        header: () => <CustomHeader title={route.name} />,
        headerShown: false, // Let each screen handle its own header
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 0.5,
          borderTopColor: colors.border || '#E5E5EA',
          height: Platform.OS === 'ios' ? 84 : 65,
          paddingBottom: Platform.OS === 'ios' ? 34 : 12,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
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
          } else if (route.name === 'Communities') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Calls') {
            iconName = focused ? 'call' : 'call-outline';
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
          headerShown: true,
        }}
      />
      <Tab.Screen 
        name="Communities" 
        component={CommunitiesScreen}
        options={{
          tabBarLabel: 'Communities',
          headerShown: true,
        }}
      />
      <Tab.Screen 
        name="Calls" 
        component={CallsScreen}
        options={{
          tabBarLabel: 'Calls',
          headerShown: true,
        }}
      />
    </Tab.Navigator>
  );
}
