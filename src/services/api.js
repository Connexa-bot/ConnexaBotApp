import axios from 'axios';
import { SERVER_URL as API_BASE_URL } from '../config';

// Validate API_BASE_URL
if (!API_BASE_URL) {
  console.error('⚠️ API_BASE_URL is not defined!');
  console.error('Please set SERVER_URL in src/config.js');
}

console.log('🔗 API Base URL:', API_BASE_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('📤 API Request:', config.method.toUpperCase(), config.url);
    console.log('📤 Full URL:', `${config.baseURL}${config.url}`);
    if (config.data) {
      console.log('📤 Request Data:', config.data);
    }
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('❌ API Response Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('❌ Network Error: No response received');
      console.error('❌ Check if backend is running at:', API_BASE_URL);
    } else {
      console.error('❌ Error:', error.message);
    }
    return Promise.reject(error);
  }
);
// ============= CONNECTION & SESSION =============

export const checkApiStatus = async () => {
  return await api.get('/api');
};

export const connectToServer = async (phone) => {
  return await api.post('/api/connect', { phone });
};

export const getConnectionStatus = async (phone) => {
  return await api.get(`/api/status/${phone}`);
};

export const logoutWhatsApp = async (phone) => {
  return await api.post('/api/logout', { phone });
};

// ============= CHATS =============

export const getChats = async (phone) => {
  return await api.get(`/api/chats/${phone}`);
};

// ============= CONTACTS =============

export const contactAction = async (phone, action, data = {}) => {
  return await api.post('/api/contacts/action', {
    phone,
    action,
    ...data,
  });
};

export const getContacts = async (phone) => {
  return await contactAction(phone, 'get');
};

export const blockContact = async (phone, jid) => {
  return await contactAction(phone, 'block', { jid });
};

export const unblockContact = async (phone, jid) => {
  return await contactAction(phone, 'unblock', { jid });
};

export const getBlockedContacts = async (phone) => {
  return await contactAction(phone, 'blocked');
};

// ============= GROUPS =============

export const getGroups = async (phone) => {
  return await api.get(`/api/groups/${phone}`);
};

export const groupAction = async (phone, action, data = {}) => {
  return await api.post('/api/groups/action', {
    phone,
    action,
    ...data,
  });
};

export const createGroup = async (phone, name, participants) => {
  return await groupAction(phone, 'create', { name, participants });
};

export const addParticipants = async (phone, groupId, participants) => {
  return await groupAction(phone, 'add', { groupId, participants });
};

export const removeParticipants = async (phone, groupId, participants) => {
  return await groupAction(phone, 'remove', { groupId, participants });
};

export const promoteParticipants = async (phone, groupId, participants) => {
  return await groupAction(phone, 'promote', { groupId, participants });
};

export const demoteParticipants = async (phone, groupId, participants) => {
  return await groupAction(phone, 'demote', { groupId, participants });
};

export const updateGroupSubject = async (phone, groupId, subject) => {
  return await groupAction(phone, 'updateSubject', { groupId, subject });
};

export const updateGroupDescription = async (phone, groupId, description) => {
  return await groupAction(phone, 'updateDescription', { groupId, description });
};

export const updateGroupSettings = async (phone, groupId, setting) => {
  return await groupAction(phone, 'updateSettings', { groupId, setting });
};

export const leaveGroup = async (phone, groupId) => {
  return await groupAction(phone, 'leave', { groupId });
};

export const getGroupInviteCode = async (phone, groupId) => {
  return await groupAction(phone, 'getInviteCode', { groupId });
};

export const revokeGroupInviteCode = async (phone, groupId) => {
  return await groupAction(phone, 'revokeInviteCode', { groupId });
};

export const acceptGroupInvite = async (phone, inviteCode) => {
  return await groupAction(phone, 'acceptInvite', { inviteCode });
};

export const getGroupMetadata = async (phone, groupId) => {
  return await groupAction(phone, 'getMetadata', { groupId });
};

// ============= MESSAGES =============

export const sendMessage = async (phone, to, text) => {
  return await api.post('/api/messages/send', { phone, to, text });
};

export const downloadMedia = async (phone, chatId, msgId, type) => {
  return await api.post('/api/messages/download', {
    phone,
    chatId,
    msgId,
    type,
  });
};

export const messageAction = async (phone, action, data = {}) => {
  return await api.post('/api/messages/action', {
    phone,
    action,
    ...data,
  });
};

export const deleteMessage = async (phone, chatId, messageKey) => {
  return await messageAction(phone, 'delete', { chatId, messageKey });
};

export const forwardMessage = async (phone, to, messageKey) => {
  return await messageAction(phone, 'forward', { to, messageKey });
};

export const starMessage = async (phone, chatId, messageId) => {
  return await messageAction(phone, 'star', { chatId, messageId });
};

export const reactToMessage = async (phone, chatId, messageKey, emoji) => {
  return await messageAction(phone, 'react', { chatId, messageKey, emoji });
};

export const editMessage = async (phone, chatId, messageKey, newText) => {
  return await messageAction(phone, 'edit', { chatId, messageKey, newText });
};

// ============= PRESENCE =============

export const presenceAction = async (phone, action, data = {}) => {
  return await api.post('/api/presence/action', {
    phone,
    action,
    ...data,
  });
};

export const updatePresence = async (phone, chatId, presence) => {
  return await presenceAction(phone, 'update', { chatId, presence });
};

export const subscribeToPresence = async (phone, jid) => {
  return await presenceAction(phone, 'subscribe', { jid });
};

// ============= PROFILE =============

export const profileAction = async (phone, action, data = {}) => {
  return await api.post('/api/profile/action', {
    phone,
    action,
    ...data,
  });
};

export const updateProfileName = async (phone, name) => {
  return await profileAction(phone, 'updateName', { name });
};

export const updateProfileStatus = async (phone, status) => {
  return await profileAction(phone, 'updateStatus', { status });
};

export const updateProfilePicture = async (phone, jid, imageBuffer) => {
  return await profileAction(phone, 'updatePicture', { jid, imageBuffer });
};

export const removeProfilePicture = async (phone, jid) => {
  return await profileAction(phone, 'removePicture', { jid });
};

export const getProfilePicture = async (phone, jid) => {
  return await profileAction(phone, 'getPicture', { jid });
};

// Export API instance and base URL for debugging
export { api, API_BASE_URL };
export default api;
