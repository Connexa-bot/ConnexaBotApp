import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useThemeContext } from "../contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

// Screens
import SplashScreen from "../screens/SplashScreen";
import LoginScreen from "../screens/LoginScreen";
import ChatsScreen from "../screens/ChatsScreen";
import UpdatesScreen from "../screens/UpdatesScreen";
import CommunitiesScreen from "../screens/CommunitiesScreen";
import CallsScreen from "../screens/CallsScreen";
import ChatViewScreen from "../screens/ChatViewScreen";
import CustomHeader from "../components/CustomHeader";
import { SocketProvider } from "../contexts/SocketContext";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs({ route }) {
    const { theme } = useThemeContext();
    const phone = route.params?.phone;

    // Safeguard: Don't render tabs until the phone number is available.
    if (!phone) {
        return null;
    }

    return (
      <SocketProvider phone={phone}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            header: () => <CustomHeader title="WhatsApp" />,
            tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Chats') {
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            } else if (route.name === 'Updates') {
              iconName = focused ? 'sync-circle' : 'sync-circle-outline';
            } else if (route.name === 'Communities') {
                iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === 'Calls') {
              iconName = focused ? 'call' : 'call-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: theme.colors.card,
          },
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

export default function RootNavigator() {
  const { theme } = useThemeContext();

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="ChatView"
          component={ChatViewScreen}
          options={({ route }) => ({
            title: route.params.chatName,
            headerBackTitleVisible: false,
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}