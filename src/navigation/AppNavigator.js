import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';

// Screens
import SplashScreen from '../screens/SplashScreen'; // Use the new splash screen
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import ChatViewScreen from '../screens/ChatViewScreen';
import MainTabNavigator from './MainTabNavigator';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();


const MainAppHeader = () => (
  <View
    style={{
      backgroundColor: '#1F2C34',
      paddingTop: 40,
      paddingBottom: 15,
      paddingHorizontal: 15,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}
  >
    <Text style={{ color: '#E9EDEF', fontSize: 20, fontWeight: '600' }}>
      ConnexaBot
    </Text>
    <View style={{ flexDirection: 'row' }}>
      <TouchableOpacity style={{ marginLeft: 20 }}>
        <MaterialIcons name="camera-alt" size={24} color="#8696A0" />
      </TouchableOpacity>
      <TouchableOpacity style={{ marginLeft: 20 }}>
        <MaterialIcons name="search" size={24} color="#8696A0" />
      </TouchableOpacity>
      <TouchableOpacity style={{ marginLeft: 20 }}>
        <MaterialIcons name="more-vert" size={24} color="#8696A0" />
      </TouchableOpacity>
    </View>
  </View>
);

function MainAppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{
          header: () => <MainAppHeader />,
        }}
      />
      <Stack.Screen name="ChatView" component={ChatViewScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
    const { isAuthenticated, isConnected, isReconnecting } = useAuth();

    if (isReconnecting) {
        return <SplashScreen />;
    }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated && isConnected ? (
        <Stack.Screen name="MainApp" component={MainAppStack} />
      ) : (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
    // Styles for header, etc. can remain if needed by other components in this file.
    // For now, removing the reconnecting screen styles as the component is removed.
});