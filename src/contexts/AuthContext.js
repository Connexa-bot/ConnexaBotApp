import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const phone = await SecureStore.getItemAsync('userPhone');
        if (phone) {
          setUser({ phone });
        }
      } catch (e) {
        console.error('Failed to load user from secure store', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (phone) => {
    try {
      await SecureStore.setItemAsync('userPhone', phone);
      setUser({ phone });
    } catch (e) {
      console.error('Failed to save user to secure store', e);
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('userPhone');
      setUser(null);
    } catch (e) {
      console.error('Failed to remove user from secure store', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);