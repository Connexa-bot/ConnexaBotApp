import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import useNavigationBar from '../hooks/useNavigationBar';
import ChatsScreen from '../screens/ChatsScreen';
import UpdatesScreen from '../screens/UpdatesScreen';
import CommunitiesScreen from '../screens/CommunitiesScreen';
import CallsScreen from '../screens/CallsScreen';

const Tab = createBottomTabNavigator();

const TabBarIcon = ({ focused, iconName, color, badge }) => {
  const scaleAnim = React.useRef(new Animated.Value(focused ? 1 : 0.9)).current;

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1 : 0.9,
      useNativeDriver: true,
      friction: 5,
    }).start();
  }, [focused]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <View>
        <Ionicons name={iconName} size={24} color={color} />
        {badge > 0 && (
          <View style={styles.badge}>
            <View style={[styles.badgeCircle, { backgroundColor: '#25D366' }]} />
          </View>
        )}
      </View>
    </Animated.View>
  );
};

export default function MainTabNavigator() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  useNavigationBar();

  return (
    <Tab.Navigator
      initialRouteName="Chats"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopWidth: 0,
          height: 58 + insets.bottom,
          paddingBottom: 6 + insets.bottom,
          paddingTop: 6,
          elevation: 0,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: isDark ? '#8696A0' : '#5F6368',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarHideOnKeyboard: Platform.OS === 'android',
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          let badge = 0;

          if (route.name === 'Chats') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            // badge should come from actual unread count from context/state
            badge = 0; // Only show if there are actual unread messages
          } else if (route.name === 'Updates') {
            iconName = focused ? 'disc' : 'disc-outline';
            // badge should show only if there are new/unviewed statuses
            badge = 0; // Only show if there are new statuses
          } else if (route.name === 'Communities') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Calls') {
            iconName = focused ? 'call' : 'call-outline';
          }

          return <TabBarIcon focused={focused} iconName={iconName} color={color} badge={badge} />;
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
        name="Communities"
        component={CommunitiesScreen}
        options={{
          tabBarLabel: 'Communities',
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

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -2,
    right: -6,
  },
  badgeCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
