import axios from 'axios';

const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setApiBaseUrl = (url) => {
  apiClient.defaults.baseURL = url;
};

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

export const getStatuses = (phone) => {
  return apiClient.get(`/statuses/${phone}`);
};

export const postStatus = (phone, text) => {
  return apiClient.post('/poststatus', { phone, text });
};

export default apiClient;