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
          paddingBottom: 8 + insets.bottom,
          paddingTop: 8,
          elevation: 0,
        },
        tabBarActiveTintColor: '#00A884',
        tabBarInactiveTintColor: isDark ? '#8696A0' : '#667781',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '400',
          marginTop: 4,
        },
        tabBarHideOnKeyboard: Platform.OS === 'android',
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          let badge = 0;

          if (route.name === 'Chats') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
            badge = 3; // Example badge count
          } else if (route.name === 'Updates') {
            iconName = focused ? 'radio-button-on' : 'radio-button-off-outline';
            badge = 1;
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
