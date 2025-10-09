import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { connectToServer, getConnectionStatus, logoutWhatsApp } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedPhone = await SecureStore.getItemAsync('userPhone');
      if (storedPhone) {
        const status = await checkStatus(storedPhone);
        if (status === 'connected') {
          setUser({ phone: storedPhone });
          setConnectionStatus('connected');
        } else {
          await SecureStore.deleteItemAsync('userPhone');
        }
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async (phone) => {
    try {
      const response = await getConnectionStatus(phone);
      return response.data.status;
    } catch (error) {
      console.error('Error checking status:', error);
      return 'disconnected';
    }
  };

  const login = async (phone) => {
    try {
      setLoading(true);
      setConnectionStatus('connecting');
      const response = await connectToServer(phone);
      
      if (response.data.qr) {
        setQrCode(response.data.qr);
        setConnectionStatus('qr_ready');
        return { success: true, qr: response.data.qr };
      } else if (response.data.status === 'connected') {
        await SecureStore.setItemAsync('userPhone', phone);
        setUser({ phone });
        setConnectionStatus('connected');
        setQrCode(null);
        return { success: true, connected: true };
      }
    } catch (error) {
      console.error('Login error:', error);
      setConnectionStatus('error');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (user?.phone) {
        await logoutWhatsApp(user.phone);
        await SecureStore.deleteItemAsync('userPhone');
      }
      setUser(null);
      setQrCode(null);
      setConnectionStatus('disconnected');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateConnectionStatus = (status) => {
    setConnectionStatus(status);
    if (status === 'connected' && qrCode) {
      setQrCode(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        qrCode,
        connectionStatus,
        login,
        logout,
        updateConnectionStatus,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
