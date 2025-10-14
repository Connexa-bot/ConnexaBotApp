import React, { createContext, useState, useContext, useEffect } from 'react';
import API_ENDPOINTS, { callAPI } from '../services/api';
import { storage } from '../utils/storage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState(null);
  const [linkCode, setLinkCode] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    checkStoredUser();
  }, []);

  const checkStoredUser = async () => {
    try {
      const storedPhone = await storage.getItem('userPhone');
      console.log('📱 Checking stored phone:', storedPhone);
      
      if (storedPhone) {
        console.log('✅ Session found, setting user immediately');
        setUser({ phone: storedPhone });
        setConnectionStatus('connected');
        
        // Verify connection in background (don't block UI)
        setTimeout(async () => {
          try {
            const statusResponse = await Promise.race([
              callAPI(API_ENDPOINTS.GET_STATUS(storedPhone)),
              new Promise((_, reject) => setTimeout(() => reject(new Error('API timeout')), 3000))
            ]);

            if (!statusResponse?.connected) {
              console.log('⚠️ Background verification failed - session expired');
              await storage.deleteItem('userPhone');
              setUser(null);
              setConnectionStatus('disconnected');
            }
          } catch (err) {
            console.warn('⚠️ Background verification error:', err.message);
          }
        }, 100);
      } else {
        console.log('ℹ️ No stored user found');
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      console.error('❌ Error checking stored user:', error);
      setConnectionStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  const login = async (phone) => {
    try {
      console.log('🔹 [AUTH] Starting login for phone:', phone);
      
      const data = await callAPI(API_ENDPOINTS.CONNECT(phone));
      console.log('🔹 [AUTH] Full backend response:', JSON.stringify(data, null, 2));

      if (data?.qrCode) {
        console.log('🔹 [AUTH] ✅ QR Code received!');
        console.log('🔹 [AUTH] QR Code length:', data.qrCode.length);
        setQrCode(data.qrCode);
      } else {
        console.log('🔹 [AUTH] ⚠️ No QR Code in response');
        setQrCode(null);
      }

      if (data?.linkCode) {
        console.log('🔹 [AUTH] ✅ Link Code received:', data.linkCode);
        setLinkCode(data.linkCode);
      } else {
        console.log('🔹 [AUTH] ⚠️ No Link Code in response');
        setLinkCode(null);
      }

      if (data?.connected) {
        setConnectionStatus('connected');
        setUser({ phone });
      } else {
        setConnectionStatus('qr_ready');
      }

      console.log('🔹 [AUTH] Returning result:', {
        success: true,
        qrCode: data?.qrCode ? 'present' : 'missing',
        linkCode: data?.linkCode || 'missing'
      });

      return {
        success: true,
        qrCode: data?.qrCode,
        linkCode: data?.linkCode,
        connected: data?.connected
      };
    } catch (error) {
      console.error('🔹 [AUTH] ❌ Login error:', error);
      console.error('🔹 [AUTH] Error details:', error.message);
      
      setConnectionStatus('error');
      
      return {
        success: false,
        error: error.message || 'Network Error'
      };
    }
  };

  const logout = async () => {
    try {
      if (user?.phone) {
        console.log('🔹 [AUTH] Logging out phone:', user.phone);
        await callAPI(API_ENDPOINTS.LOGOUT(user.phone));
      }
      
      await storage.deleteItem('userPhone');
      setUser(null);
      setQrCode(null);
      setLinkCode(null);
      setConnectionStatus('disconnected');
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  const updateConnectionStatus = (status) => {
    console.log('🔹 [AUTH] Connection status updated:', status);
    setConnectionStatus(status);
  };

  const value = {
    user,
    setUser,
    loading,
    login,
    logout,
    qrCode,
    linkCode,
    connectionStatus,
    updateConnectionStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
