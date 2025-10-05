import axios from 'axios';

// IMPORTANT: Replace with your server's actual IP address or domain
const API_URL = 'http://192.168.1.10:5000'; // Example: 'http://your-server.com'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const connectToServer = (phone) => {
  return apiClient.post('/connect', { phone });
};

export const getConnectionStatus = (phone) => {
  return apiClient.get(`/status/${phone}`);
};

export const getChats = (phone) => {
  return apiClient.get(`/chats/${phone}`);
};

export const getMessages = (phone, chatId) => {
  return apiClient.get(`/messages/${phone}/${chatId}`);
};

export const sendMessage = (phone, to, message) => {
  return apiClient.post('/send-message', { phone, to, message });
};

export default apiClient;