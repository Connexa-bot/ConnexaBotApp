import React, { createContext, useState, useContext, useEffect } from 'react';
import { connectToServer, getConnectionStatus, logoutWhatsApp } from '../services/api';
import { storage } from '../utils/storage';

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
      const storedPhone = await storage.getItem('userPhone');
      if (storedPhone) {
        const status = await checkStatus(storedPhone);
        if (status === 'connected') {
          setUser({ phone: storedPhone });
          setConnectionStatus('connected');
        } else {
          await storage.deleteItem('userPhone');
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
        await storage.setItem('userPhone', phone);
        setUser({ phone });
        setConnectionStatus('connected');
        setQrCode(null);
        return { success: true, connected: true };
      }
    } catch (error) {
      console.error('Login error:', error);
      setConnectionStatus('error');
      const errorMsg = error.response?.data?.error || error.message || 'Unable to connect to server. Please check your internet connection and try again.';
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (user?.phone) {
        await logoutWhatsApp(user.phone);
        await storage.deleteItem('userPhone');
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
