import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useThemeContext } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { SocketProvider } from '../contexts/SocketContext';

// Screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import ChatsScreen from '../screens/ChatsScreen';
import UpdatesScreen from '../screens/UpdatesScreen';
import CommunitiesScreen from '../screens/CommunitiesScreen';
import CallsScreen from '../screens/CallsScreen';
import ChatViewScreen from '../screens/ChatViewScreen';
import CustomHeader from '../components/CustomHeader';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainApp() {
  const { theme } = useThemeContext();
  const { user } = useAuth();

  if (!user || !user.phone) {
    return null; // Safeguard
  }

  // SocketProvider now only needs the phone number
  return (
    <SocketProvider phone={user.phone}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          header: () => <CustomHeader title="WhatsApp" />,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Chats') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            else if (route.name === 'Updates') iconName = focused ? 'sync-circle' : 'sync-circle-outline';
            else if (route.name === 'Communities') iconName = focused ? 'people' : 'people-outline';
            else if (route.name === 'Calls') iconName = focused ? 'call' : 'call-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: { backgroundColor: theme.colors.card },
        })}
      >
        <Tab.Screen name="Chats" component={ChatsScreen} />
        <Tab.Screen name="Updates" component={UpdatesScreen} />
        <Tab.Screen name="Communities" component={CommunitiesScreen} />
        <Tab.Screen name="Calls" component={CallsScreen} />
      </Tab.Navigator>
    </SocketProvider>
  );
}

function AppNavigator() {
    const { isAuthenticated } = useAuth();
    const { theme } = useThemeContext();

    return (
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen name="MainApp" component={MainApp} options={{ headerShown: false }} />
            <Stack.Screen
              name="ChatView"
              component={ChatViewScreen}
              options={({ route }) => ({
                title: route.params.chatName,
                headerBackTitleVisible: false,
              })}
            />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    );
  }

  export default function RootNavigator() {
    const { theme } = useThemeContext();
    const [isSplashFinished, setIsSplashFinished] = React.useState(false);

    if (!isSplashFinished) {
      return <SplashScreen onFinish={() => setIsSplashFinished(true)} />;
    }

    return (
      <NavigationContainer theme={theme}>
        <AppNavigator />
      </NavigationContainer>
    );
  }