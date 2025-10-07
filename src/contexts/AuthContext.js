import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { connectToServer, getConnectionStatus } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(true);

  const verifyConnection = useCallback(async (phone) => {
    console.log(`Verifying connection for ${phone}...`);
    try {
      const { data } = await getConnectionStatus(phone);
      console.log('Connection status:', data);
      if (data.connected) {
        setUser({ phone });
        setIsConnected(true);
        console.log('Session restored and connection verified.');
        return true;
      }
    } catch (error) {
      console.error('Connection verification failed:', error.message);
    }
    return false;
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      console.log('Attempting to restore session...');
      setIsReconnecting(true);
      let phone = null;
      try {
        phone = await SecureStore.getItemAsync('userPhone');
        if (phone) {
          console.log(`Found stored phone: ${phone}.`);
          const connectionActive = await verifyConnection(phone);
          if (!connectionActive) {
            // If verification fails, treat as logged out
            await logout();
          }
        } else {
          console.log('No stored user phone found.');
        }
      } catch (e) {
        console.error('Failed to load user from secure store', e);
      } finally {
        setIsLoading(false);
        setIsReconnecting(false);
      }
    };

    restoreSession();
  }, [verifyConnection]);

  const login = async (phone) => {
    console.log(`Attempting to log in with ${phone}...`);
    setIsLoading(true);
    try {
        // We assume the connection is established on the LoginScreen
        // and this function is called upon success.
        await SecureStore.setItemAsync('userPhone', phone);
        setUser({ phone });
        setIsConnected(true);
        console.log('Login successful, user and connection state set.');
    } catch (e) {
        console.error('Failed to save user to secure store', e);
        setIsConnected(false);
    } finally {
        setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('Logging out...');
    setIsLoading(true);
    try {
      // Also need to inform the backend if possible
      const phone = await SecureStore.getItemAsync('userPhone');
      // await apiClient.post('/logout', { phone }); // Optional: Depends on backend implementation
      await SecureStore.deleteItemAsync('userPhone');
    } catch (e) {
      console.error('Failed to remove user from secure store', e);
    } finally {
      setUser(null);
      setIsConnected(false);
      setIsLoading(false);
      console.log('User logged out, session cleared.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isConnected,
        isLoading,
        isReconnecting,
        login,
        logout,
        verifyConnection
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);